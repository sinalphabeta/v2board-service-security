export const renderHtml = (template: string, data: Record<string, string>) => template.replace(/\$\{(\w+)\}/g, (_match, key) => data[key] || '')
