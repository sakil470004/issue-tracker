import { PrismaClient, Priority, Status, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface SearchParams {
  search?: string;
  status?: Status[];
  priority?: Priority[];
  assigneeId?: string;
  creatorId?: string;
  teamId?: string;
  projectId?: string;
  labels?: string[];
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export class SearchService {
  async searchIssues(params: SearchParams, userId: string) {
    try {
      const {
        search,
        status,
        priority,
        assigneeId,
        creatorId,
        teamId,
        projectId,
        labels,
        startDate,
        endDate,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = params;

      // Build where clause
      const whereConditions: Prisma.IssueWhereInput = {};

      // Base access control
      whereConditions.project = {
        team: {
          members: {
            some: {
              userId
            }
          }
        }
      };

      // Add search condition
      if (search) {
        whereConditions.OR = [
          {
            title: {
              contains: search,
              mode: Prisma.QueryMode.insensitive
            }
          },
          {
            description: {
              contains: search,
              mode: Prisma.QueryMode.insensitive
            }
          }
        ];
      }

      // Add other filters
      if (status?.length) {
        whereConditions.status = { in: status };
      }

      if (priority?.length) {
        whereConditions.priority = { in: priority };
      }

      if (assigneeId) {
        whereConditions.assigneeId = assigneeId;
      }

      if (creatorId) {
        whereConditions.creatorId = creatorId;
      }

      if (teamId) {
        whereConditions.project = {
          ...whereConditions.project,
          teamId
        };
      }

      if (projectId) {
        whereConditions.projectId = projectId;
      }

      if (labels?.length) {
        whereConditions.labels = {
          some: {
            name: {
              in: labels
            }
          }
        };
      }

      // Date range conditions
      if (startDate || endDate) {
        whereConditions.createdAt = {};
        
        if (startDate) {
          whereConditions.createdAt.gte = startDate;
        }
        
        if (endDate) {
          whereConditions.createdAt.lte = endDate;
        }
      }

      // Get total count for pagination
      const total = await prisma.issue.count({
        where: whereConditions
      });

      // Get paginated results
      const issues = await prisma.issue.findMany({
        where: whereConditions,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          labels: true,
          project: {
            select: {
              id: true,
              name: true,
              team: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              comments: true,
              activities: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: (page - 1) * limit,
        take: limit
      });

      return {
        issues,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total
        }
      };
    } catch (error) {
      console.error('Search issues error:', error);
      throw error;
    }
  }

  async getSavedFilters(userId: string) {
    return prisma.savedFilter.findMany({
      where: {
        userId
      }
    });
  }

  async saveFilter(userId: string, name: string, filter: SearchParams) {
    return prisma.savedFilter.create({
      data: {
        name,
        filter: filter as any,
        userId
      }
    });
  }
}

export const searchService = new SearchService();