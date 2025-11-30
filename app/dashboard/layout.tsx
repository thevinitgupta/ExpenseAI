"use client"
import { SessionProvider } from 'next-auth/react'
import React, { PropsWithChildren } from 'react'

const layout = ({children} : PropsWithChildren) => {
  return (
      <SessionProvider>
          {children}
    </SessionProvider>
  )
}

export default layout