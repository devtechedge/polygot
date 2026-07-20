import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    mql.addEventListener("change", onChange)
    
    // Set initial state asynchronously on mount
    const timer = setTimeout(() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }, 0)

    return () => {
      mql.removeEventListener("change", onChange)
      clearTimeout(timer)
    }
  }, [])

  return isMobile
}

