import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { addHours, addDays, addWeeks, addMonths, differenceInMilliseconds } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type TicketType = "REQUEST" | "DEMAND" | "PROBLEM" | "INCIDENT";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Status = "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";

export interface Comment {
  id: string;
  ticket_id?: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Attachment {
  name: string;
  url: string;
  size: number;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  priority?: Priority;
  status: Status;
  createdAt: string;
  closedAt?: string;
  assignee?: string;
  assignee_id?: string;
  comments?: Comment[];
  attachments?: Attachment[];
}

export const SLA_CONFIG = {
  REQUEST: { duration: 1000 * 60 * 60 * 24 * 7, label: "1 Semana" }, // 1 week
  DEMAND: { duration: 1000 * 60 * 60 * 24 * 30, label: "1 Mês" }, // ~1 month
  PROBLEM: { duration: 1000 * 60 * 60 * 24 * 14, label: "2 Semanas" }, // 2 weeks
  INCIDENT: {
    LOW: { duration: 1000 * 60 * 60 * 24 * 7, label: "1 Semana" },
    MEDIUM: { duration: 1000 * 60 * 60 * 24 * 2, label: "2 Dias" },
    HIGH: { duration: 1000 * 60 * 60 * 3, label: "3 Horas" },
  },
};

export function getDeadline(ticket: Ticket): Date {
  const created = new Date(ticket.createdAt);
  if (ticket.type === "INCIDENT") {
    const priority = ticket.priority || "LOW";
    return new Date(created.getTime() + SLA_CONFIG.INCIDENT[priority].duration);
  }
  return new Date(created.getTime() + SLA_CONFIG[ticket.type].duration);
}

export function getSLAStatus(ticket: Ticket) {
  const now = new Date();
  const deadline = getDeadline(ticket);
  const totalDuration = deadline.getTime() - new Date(ticket.createdAt).getTime();
  const remaining = deadline.getTime() - now.getTime();
  const percentage = remaining / totalDuration;

  const isBreached = remaining < 0;
  const isWarning = !isBreached && percentage < 0.2; // Less than 20% remaining

  return {
    deadline,
    remaining,
    percentage,
    isBreached,
    isWarning,
  };
}

export function formatDuration(ms: number): string {
  if (ms < 0) return "BREACHED";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}
