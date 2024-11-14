import { Request, Response } from "express";
import { PrismaClient, Priority, Status, Prisma } from "@prisma/client";
import { validationResult } from "express-validator";
import { wsService } from "../index";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}
export const createIssue = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const {
      title,
      description,
      priority,
      projectId,
      assigneeId,
      labels = [],
    } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    // Check if user has access to project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        team: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    });

    if (!project) {
      res.status(403).json({ error: "Project access denied" });
      return;
    }

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        priority: priority || Priority.MEDIUM,
        project: { connect: { id: projectId } },
        createdBy: { connect: { id: userId } },
        ...(assigneeId && { assignedTo: { connect: { id: assigneeId } } }),
        labels: {
          connectOrCreate: labels.map((label: string) => ({
            where: { name: label },
            create: {
              name: label,
              color: generateRandomColor(), // Implement this helper function
            },
          })),
        },
        activities: {
          create: {
            action: "CREATED",
            description: "Issue created",
            userId,
          },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        labels: true,
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Notify project members
    wsService.emitToProject(projectId, "ISSUE_CREATED", issue);

    res.status(201).json(issue);
  } catch (error) {
    console.error("Create issue error:", error);
    res.status(500).json({ error: "Failed to create issue" });
  }
};

export const getIssues = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { projectId, status, priority, assigneeId, search, labels } =
      req.query;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const where: Prisma.IssueWhereInput = {
      project: {
        team: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      ...(projectId && { projectId: projectId as string }),
      ...(status && { status: status as Status }),
      ...(priority && { priority: priority as Priority }),
      ...(assigneeId && { assigneeId: assigneeId as string }),
      ...(search && {
        OR: [
          {
            title: {
              contains: search as string,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            description: {
              contains: search as string,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
      ...(labels && {
        labels: {
          some: {
            name: {
              in: (labels as string).split(","),
            },
          },
        },
      }),
    };

    const issues = await prisma.issue.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        labels: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(issues);
  } catch (error) {
    console.error("Get issues error:", error);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
};

export const updateIssueStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const issue = await prisma.issue.update({
      where: { id },
      data: {
        status: status as Status,
        activities: {
          create: {
            action: "STATUS_CHANGED",
            description: `Status changed to ${status}`,
            userId,
          },
        },
      },
      include: {
        assignedTo: true,
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    wsService.emitToProject(issue.projectId, "ISSUE_UPDATED", issue);

    res.json(issue);
  } catch (error) {
    console.error("Update issue status error:", error);
    res.status(500).json({ error: "Failed to update issue status" });
  }
};

export const addComment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        issue: { connect: { id } },
        user: { connect: { id: userId } },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create activity for the comment
    await prisma.activityLog.create({
      data: {
        action: "COMMENTED",
        description: "Added a comment",
        issue: { connect: { id } },
        user: { connect: { id: userId } }, // Fixed this line
      },
    });

    wsService.emitToProject(id, "ISSUE_COMMENTED", { issueId: id, comment });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

function generateRandomColor(): string {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9B9B9B",
    "#A8E6CF",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
