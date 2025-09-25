export interface Workflow {
  workflowid: string;
  name: string;
  createdon: string;
  modifiedon: string;
  statecode: number;
  statuscode: number;
  uniquename: string;
  category: number;
  description: string | null;
  // Add other fields as needed from the API response
  [key: string]: any; 
}

export type SortConfig = {
  key: keyof Workflow | null;
  direction: 'ascending' | 'descending';
};

export interface WorkflowsResponse {
  workflows: Workflow[];
  nextLink: string | null;
  totalCount: number;
  requestUrl: string;
}
