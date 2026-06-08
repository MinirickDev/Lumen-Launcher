// Telemetry fully disabled in Lumen Launcher.
// The original XMCL sent crash reports to ci010's Azure Application Insights.
// No data is collected or transmitted by Lumen Launcher.

const noop = () => {}
const noopObj = new Proxy({}, { get: () => noopObj, set: () => true, apply: () => noopObj }) as any

export const appInsights: any = noopObj
