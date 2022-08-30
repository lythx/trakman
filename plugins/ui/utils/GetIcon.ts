import ICONS from '../config/Icons.js'

export const getIcon = (iconName: string): string => {
    const split: string[] = iconName.split('.')
    let obj = ICONS
    for (const e of split) {
        obj = (obj as any)[e] 
    }
    return obj as any
}