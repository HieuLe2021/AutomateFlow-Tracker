
import { Workflow, SortConfig, WorkflowsResponse } from '../types';

const TOKEN_URL = 'https://de210e4bcd22e60591ca8e841aad4b.8e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/1db8c4d15497441287f7c888e8888ed4/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=yJt8b-T8Y5cybSXqjRjD4nziIvXhPV7F0IfNM-aV6Lg';
const DATAVERSE_URL = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/workflows';
const PAGE_SIZE = 50;

/**
 * Fetches a JWT token from the Power Automate endpoint.
 * This function is robustly designed to handle both plain text and JSON responses.
 * @returns A promise that resolves to the JWT token string.
 */
async function getAuthToken(): Promise<string> {
    console.log('Requesting auth token...');
    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Body can be empty but is often required for POST
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get auth token:', errorText);
        throw new Error(`HTTP error ${response.status} while fetching token.`);
    }

    const responseText = await response.text();
    
    try {
        const data = JSON.parse(responseText);
        // Common patterns for tokens in JSON are { "token": "..." } or { "accessToken": "..." }
        if (data && typeof data === 'object') {
            if (typeof data.token === 'string' && data.token) {
                console.log('Successfully received auth token from JSON response (key: token).');
                return data.token;
            }
            if (typeof data.accessToken === 'string' && data.accessToken) {
                console.log('Successfully received auth token from JSON response (key: accessToken).');
                return data.accessToken;
            }
        }
    } catch (e) {
        // Not a JSON response, or not in the expected format.
        // We assume it's a plain text token, which is the original expectation.
        console.log('Response is not JSON, treating as plain text token.');
    }

    console.log('Successfully received auth token as plain text.');
    // Trim whitespace/newlines which can invalidate the bearer token
    return responseText.trim();
}


/**
 * Fetches workflow data from a given Dataverse API URL.
 * @param url The full URL to fetch data from.
 * @param token The JWT authorization token.
 * @returns A promise that resolves to a WorkflowsResponse object.
 */
async function getWorkflowsFromUrl(url: string, token: string): Promise<Omit<WorkflowsResponse, 'requestUrl'>> {
    console.log(`Fetching workflows from: ${url}`);
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json',
            'Prefer': 'odata.include-annotations="OData.Community.Display.V1.FormattedValue"'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch workflows:', errorText);
        throw new Error(`HTTP error ${response.status} while fetching workflows.`);
    }

    const data = await response.json();
    console.log('Successfully fetched workflows.');
    return {
        workflows: data.value as Workflow[],
        nextLink: data['@odata.nextLink'] || null,
        totalCount: data['@odata.count'] || 0,
    };
}


/**
 * Orchestrates fetching workflow data with support for sorting, filtering, and pagination.
 * @param sortConfig The configuration for sorting.
 * @param searchTerm The term to search for.
 * @param category The category to filter by.
 * @param status The status (statecode) to filter by.
 * @param url Optional URL to fetch a specific page (e.g., from @odata.nextLink).
 * @returns A promise that resolves to a WorkflowsResponse object.
 */
export async function fetchWorkflows(
    sortConfig: SortConfig,
    searchTerm: string,
    category: number | null,
    status: number | null,
    url?: string
): Promise<WorkflowsResponse> {
    const token = await getAuthToken();
    let fetchUrl: string;

    if (url) {
        fetchUrl = url;
    } else {
        const queryParams = new URLSearchParams();
        queryParams.append('$top', String(PAGE_SIZE));
        queryParams.append('$count', 'true');

        const filterClauses = [];
        if (status !== null) {
            filterClauses.push(`statecode eq ${status}`);
        }
        if (searchTerm) {
            const sanitizedSearch = searchTerm.replace(/'/g, "''");
            filterClauses.push(`(contains(name, '${sanitizedSearch}') or contains(uniquename, '${sanitizedSearch}'))`);
        }
        if (category !== null && category >= 0) {
            filterClauses.push(`category eq ${category}`);
        }
        
        if (filterClauses.length > 0) {
            queryParams.append('$filter', filterClauses.join(' and '));
        }

        if (sortConfig.key) {
            const direction = sortConfig.direction === 'ascending' ? 'asc' : 'desc';
            queryParams.append('$orderby', `${sortConfig.key} ${direction}`);
        } else {
            queryParams.append('$orderby', 'modifiedon desc');
        }
        
        fetchUrl = `${DATAVERSE_URL}?${queryParams.toString()}`;
    }

    try {
        const response = await getWorkflowsFromUrl(fetchUrl, token);
        return { ...response, requestUrl: fetchUrl };
    } catch (error) {
        console.error('Error in workflow fetching process:', error);
        throw error;
    }
}
