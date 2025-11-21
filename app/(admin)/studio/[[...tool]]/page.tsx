'use client'

/**
 * This route is responsible for the embedded Sanity Studio.
 * All routes under `/admin/studio` will be handled by this page.
 * PROTECTED: Requires admin authentication via middleware.
 */

import {NextStudio} from 'next-sanity/studio'
import config from '../../../../sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
