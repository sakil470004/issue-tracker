import { Socket } from 'socket.io';

export const socketEvents = {
  ISSUE_CREATED: 'issueCreated',
  ISSUE_UPDATED: 'issueUpdated',
  ISSUE_COMMENTED: 'issueCommented',
  ISSUE_STATUS_CHANGED: 'issueStatusChanged',
  ISSUE_ASSIGNED: 'issueAssigned',
  NOTIFICATION: 'notification'
};

export interface IssueUpdateData {
  issueId: string;
  projectId: string;
  updatedBy: string;
  updateType: string;
  data: any;
}

export const handleIssueUpdate = (socket: Socket, data: IssueUpdateData) => {
  const { projectId, updateType, data: updateData } = data;
  socket.to(`project:${projectId}`).emit(updateType, updateData);
};