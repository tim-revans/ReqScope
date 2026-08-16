import { RequirementProvider } from './requirement-provider';
import { jamaProvider } from './jama-provider';

export const supportedTools: RequirementProvider[] = [
    new jamaProvider(),
];
