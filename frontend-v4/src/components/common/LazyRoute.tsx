import { Suspense, type ComponentType, type LazyExoticComponent } from 'react'
import LazyLoadingFallback from './LazyLoadingFallback'

interface LazyRouteProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: LazyExoticComponent<ComponentType<any>>
}

/**
 * Wrapper component for lazy-loaded routes
 * Provides consistent Suspense boundary with loading fallback
 */
export default function LazyRoute({ component: Component }: LazyRouteProps) {
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      <Component />
    </Suspense>
  )
}
