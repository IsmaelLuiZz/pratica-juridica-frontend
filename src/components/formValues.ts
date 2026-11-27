export const value = (form: FormData, name: string) => String(form.get(name) ?? '').trim()
