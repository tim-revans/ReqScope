import * as vscode from 'vscode';
import { RequirementProvider, RequirementData, Credential } from "./requirement-provider";
import { getSetting } from './settings';

interface JamaAuthResponse {
    access_token: string
}

interface JamaAbstractSearchResponse {
    data: Array<{
        id: number;
        documentKey: string;
    }>;
}

interface JamaSingleItemResponse {
    data: JamaItem;
}

interface JamaItem {
    id: number;
    globalId: string;
    documentKey: string;
    itemType: number;
    childItemType: number;
    project: number;
    version: number;
    createdDate: string;
    modifiedDate: string;
    lastActivityDate: string;
    createdBy: number;
    modifiedBy: number;

    fields: Record<string, any>;

    lock: {
        lockedBy: number;
        lastLockedDate: string;
        locked: boolean;
    };
}

interface JamaMeta {
    status: string;
    timestamp: string;
}

interface JamaLink {
    href: string;
    type: string;
}

const apiSecretAuth = 'jama_api_secret';
const apiSecretID = 'jama_api_id';
const companyIDSettingName = `jamaCompanyID`;

async function getAccessToken(apiRoot: string, credentials: string): Promise<string | null> {
    const tokenUrl = `${apiRoot}/oauth/token`;

    const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
        },
        body: new URLSearchParams({
            'grant_type': 'client_credentials'
        })
    });

    if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text();
        console.error(`Jama OAuth Error (${tokenResponse.status}):`, errorBody);
        return null;
    }

    const tokenData = await tokenResponse.json() as JamaAuthResponse;
    return tokenData.access_token;
}

async function getItemID(requirement: string, apiRoot: string, accessToken: string): Promise<number | null> {
    const safeRequirement = encodeURIComponent(requirement.trim());

    const abstractUrl = `${apiRoot}/latest/abstractitems?documentKey=${safeRequirement}`;
    const abstractResponse = await fetch(abstractUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        }
    });

    if (!abstractResponse.ok) {
        const errorBody = await abstractResponse.text();
        console.error(`Jama AbstractItem API Error (${abstractResponse.status}):`, errorBody);
        return null;
    }

    const abstractData = (await abstractResponse.json()) as JamaAbstractSearchResponse;

    if (!abstractData.data || abstractData.data.length === 0) {
        console.log(`No Jama requirement found matching key: ${requirement}`);
        return null;
    }

    return abstractData.data[0].id;
}

async function getItem(itemID: number, apiRoot: string, accessToken: string): Promise<JamaSingleItemResponse | null> {
    const itemUrl = `${apiRoot}/latest/items/${itemID}`;
    const itemResponse = await fetch(itemUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        }
    });

    if (!itemResponse.ok) {
        const errorBody = await itemResponse.text();
        console.error(`Jama Item Detail API Error (${itemResponse.status}):`, errorBody);
        return null;
    }

    return (await itemResponse.json()) as JamaSingleItemResponse;
}

export class jamaProvider implements RequirementProvider {
    name = 'Jama';
    idPattern = /[A-Z]+(?:-[A-Z]+)?-\d+/i;
    command = "reqscope.setJamaCredentials";

    async fetchRequirement(id: string, context: vscode.ExtensionContext): Promise<RequirementData | null> {
        try {
            const companyID = getSetting(companyIDSettingName);
            const apiRoot = `https://${companyID}.jamacloud.com/rest`;

            const clientID = await context.secrets.get(apiSecretID);
            const clientAuth = await context.secrets.get(apiSecretAuth);
            if (!clientID || !clientAuth) {
                console.error("Jama API credentials missing from SecretStorage.");
                return null;
            }
            const credentials = Buffer.from(`${clientID}:${clientAuth}`).toString('base64');

            const accessToken = await getAccessToken(apiRoot, credentials);
            if (accessToken === null) {
                console.error('Jama API Access Token could not be fetched.');
                return null;
            }

            const numericId = await getItemID(id, apiRoot, accessToken);
            if (numericId === null) {
                console.error(`Could not find requirement ${id}`);
                return null;
            }



            const item = await getItem(numericId, apiRoot, accessToken);
            if (item === null) {
                console.error(`Could not find requirement at ${numericId}`);
                return null;
            }
            const data = item.data;

            return {
                id: data.documentKey,
                title: data.fields.name,
                description: data.fields.description,
                url: `https://${companyID}.jamacloud.com/perspective.req#/items/${data.id}?projectId=${data.project}`,
            };
        } catch (error) {
            console.error("Error fetching Jama requirement:", error);
            return null;
        }
    }

    async setCredentials(): Promise<Credential[]> {
        const idInput = await vscode.window.showInputBox({
            prompt: 'Enter your Jama API Client ID',
            password: false,
            ignoreFocusOut: true,
        });

        if (!idInput) {
            return [];
        }

        const secretInput = await vscode.window.showInputBox({
            prompt: 'Enter your Jama API Client Secret',
            password: true,
            ignoreFocusOut: true,
        });

        if (!secretInput) {
            return [];
        }

        return [
            { name: apiSecretAuth, value: secretInput },
            { name: apiSecretID, value: idInput },
        ];
    }
}
