/**
 * Marshmallow page uses its own full-height layout.
 * In Next.js App Router you can override the root layout per-segment
 * by exporting a custom layout from this folder. However, since the root layout
 * already wraps children in a shell with the sidebar, we keep it simple and
 * use CSS to fill the remaining viewport height correctly.
 */

import MarshmallowClient from './MarshmallowClient'

export const metadata = {
  title: 'Marshmallow AI — CampFire',
}

export default function MarshmallowPage() {
  return <MarshmallowClient />
}
