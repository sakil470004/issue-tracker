import { Request, Response } from 'express';
import { PrismaClient, TeamRole } from '@prisma/client';
import { validationResult } from 'express-validator';
import { wsService } from '../index';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const createTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { name, description } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
        members: {
          create: {
            user: {
              connect: { id: userId }
            },
            role: TeamRole.LEADER
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    wsService.emitToUser(userId, 'TEAM_CREATED', team);
    res.status(201).json(team);
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
};

export const getTeams = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json(teams);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

export const getTeamById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const team = await prisma.team.findFirst({
      where: {
        id,
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    res.json(team);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
};

export const addTeamMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { teamId } = req.params;
    const { userId: newMemberId, role = TeamRole.MEMBER } = req.body;
    const requestingUserId = req.user?.userId;

    if (!requestingUserId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const isLeader = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: requestingUserId,
        role: TeamRole.LEADER
      }
    });

    if (!isLeader) {
      res.status(403).json({ error: 'Only team leaders can add members' });
      return;
    }

    const member = await prisma.teamMember.create({
      data: {
        team: {
          connect: { id: teamId }
        },
        user: {
          connect: { id: newMemberId }
        },
        role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    wsService.emitToUser(newMemberId, 'TEAM_MEMBER_ADDED', { teamId, member });
    res.status(201).json(member);
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
};