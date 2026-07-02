import type { ComponentType } from 'react'

export type Persona = 'product-manager' | 'data-scientist' | 'product-designer'

export type FlowStatus = 'ready' | 'planned'

/** Which hub tab a flow belongs to. */
export type HubTab = 'beta' | 'post-beta'

/**
 * A prototype flow. Two shapes:
 *  - scenario×persona (Post-beta): has scenario/scenarioBlurb/persona, grouped + persona chips.
 *  - standalone (Beta E2E): has label/blurb, rendered as its own card with an Open link.
 */
export interface Flow {
  /** URL slug, e.g. "fixed-lp-pm" */
  id: string
  /** Hub tab grouping. */
  tab: HubTab
  status: FlowStatus
  /** The page component that plays the flow (ready flows only). */
  component?: ComponentType
  /** Figma frame ids backing this flow, in order (reference only) */
  figmaNodes?: string[]

  // scenario×persona flows (Post-beta)
  scenarioId?: string
  scenario?: string
  scenarioBlurb?: string
  persona?: Persona

  // standalone flows (Beta E2E)
  label?: string
  blurb?: string
}

export const PERSONA_LABEL: Record<Persona, string> = {
  'product-manager': 'Product Manager',
  'data-scientist': 'Data Scientist',
  'product-designer': 'Product Designer',
}
