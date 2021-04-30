import { IActivityContext } from "@geocortex/workflow/runtime/IActivityHandler";

export function mockActivityContext(): IActivityContext {
    const ctx: Partial<IActivityContext> = {
        cancellationToken: Promise.resolve() as any,
    };
    return ctx as IActivityContext;
}
