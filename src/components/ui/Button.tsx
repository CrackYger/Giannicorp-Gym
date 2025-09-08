import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
export function Button(props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { className = '', ...rest } = props as any
  return <button className={`btn ${className}`} {...rest} />
}
export function ButtonGhost(props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { className = '', ...rest } = props as any
  return <button className={`btn-ghost ${className}`} {...rest} />
}
export function ButtonOutline(props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { className = '', ...rest } = props as any
  return <button className={`btn-outline ${className}`} {...rest} />
}
