import type { IActivityContext } from "@vertigis/workflow/IActivityHandler";

export function mockActivityContext(): IActivityContext {
    const ctx: Partial<IActivityContext> = {
        cancellationToken: Promise.resolve() as any,
    };
    return ctx as IActivityContext;
}
