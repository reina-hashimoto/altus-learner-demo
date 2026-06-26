import type { ComponentType } from 'react'

export type Persona = 'product-manager' | 'data-scientist'

export type FlowStatus = 'ready' | 'planned'

/** A single end-to-end prototype flow (one scenario × one persona). */
export interface Flow {
  /** URL slug, e.g. "fixed-lp-pm" */
  id: string
  /** Scenario grouping key, e.g. "fixed-lp" */
  scenarioId: string
  /** Scenario label, e.g. "Fixed LP" */
  scenario: string
  /** Short scenario description for the index. */
  scenarioBlurb: string
  persona: Persona
  status: FlowStatus
  /** Figma frame ids backing this flow, in order (reference only) */
  figmaNodes: string[]
  /** The page component that plays the flow (ready flows only). */
  component?: ComponentType
}

export const PERSONA_LABEL: Record<Persona, string> = {
  'product-manager': 'Product Manager',
  'data-scientist': 'Data Scientist',
}
