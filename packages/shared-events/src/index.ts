import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from workspace root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const redisConnection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  tls: { rejectUnauthorized: false } // Required for Upstash
});

export const PAYROLL_QUEUE_NAME = 'payroll-events';

// Payload type for payroll run
export interface PayrollRunPayload {
  organizationId: string;
  payrollRunId: string;
  totalAmount: number; // in cents
}

// Helper to get queue
export const getPayrollQueue = () => {
  return new Queue(PAYROLL_QUEUE_NAME, { connection: redisConnection });
};

// Helper to create worker
export const createPayrollWorker = (processor: (job: any) => Promise<void>) => {
  return new Worker(PAYROLL_QUEUE_NAME, processor, { connection: redisConnection });
};
