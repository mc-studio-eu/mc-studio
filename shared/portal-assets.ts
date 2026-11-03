export type PortalAssetFolder = { id: string; label: string; hint: string }

export const PORTAL_ASSET_DEFAULT_FOLDERS: PortalAssetFolder[] = [
  { id: 'marks', label: 'Marques', hint: 'Logos et symboles, prêts à utiliser sur vos supports.' },
  { id: 'palette', label: 'Palette', hint: 'Les couleurs et associations recommandées pour votre identité.' },
  { id: 'typography', label: 'Typographie', hint: 'Les caractères qui donnent sa voix à votre marque.' },
  { id: 'applications', label: 'Applications', hint: 'Votre identité en situation, sur des supports concrets.' },
  { id: 'exports', label: 'Exports', hint: 'Fichiers visuels finalisés et prêts à télécharger.' }
]

export const portalAssetFolderKey = (label: string) => label.normalize('NFC').toLocaleLowerCase('fr')
