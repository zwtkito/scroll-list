import type { CSSProperties, FC } from 'react'
import { memo, useEffect, useRef, useState } from 'react'

const DEFAULT_PROPS = {
  fps: 60,
  speed: 60,
  style: {},
  className: '',
  reverse: false,
  mode: 'vertical'
}

interface SeamlessRollProps {
  /** 每秒?px */
  speed?: number
  style?: CSSProperties
  className?: string
  /**
   * 是否反向
   */
  reverse?: boolean
  /**
   * 滚动模式 垂直 / 水平
   */
  mode?: 'vertical' | 'horizontal'
}

const ScrollList: FC<SeamlessRollProps> = memo((props) => {
  const { className = DEFAULT_PROPS.className, style = DEFAULT_PROPS.style, mode = DEFAULT_PROPS.mode, speed = DEFAULT_PROPS.speed, reverse = DEFAULT_PROPS.reverse, children } = props
  const containerDom = useRef<HTMLDivElement | null>(null)
  const wrapperDom = useRef<HTMLDivElement | null>(null)
  const sliderDom = useRef<HTMLDivElement | null>(null)
  const sliderDomCopy = useRef<HTMLDivElement | null>(null)
  const requestRef = useRef<number>(0)
  const [step, setStep] = useState<number>(1)
  const [sliderSize, setSliderSize] = useState<number>(0)
  const [containerSize, setContainerSize] = useState<number>(0)

  const getStyle = (ele: HTMLElement, attr: string) => {
    if (window.getComputedStyle) {
      return window.getComputedStyle(ele)[attr]
    }
    return (ele as any).currentStyle[attr]
  }

  /**
   * 跑马灯
   */
  const marquee = () => {
    const key = mode === 'vertical' ? 'top' : 'left'
    const position = parseFloat(getStyle(wrapperDom.current!, key))
    if (reverse) {
      if (position >= 0) {
        wrapperDom.current!.style[key] = `-${sliderSize}px`
      } else {
        wrapperDom.current!.style[key] = `${position + step}px`
      }
    } else if (sliderSize - Math.abs(position) <= 0) {
      wrapperDom.current!.style[key] = '0px'
    } else {
      wrapperDom.current!.style[key] = `${position - step}px`
    }
    cancelAnimationFrame(requestRef.current)
    requestRef.current = requestAnimationFrame(marquee)
  }

  useEffect(() => {
    if (containerDom.current && sliderDom.current && sliderDomCopy.current) {
      const stepVal = parseFloat((speed / DEFAULT_PROPS.fps).toFixed(2))
      const sliderSizeVal = mode === 'vertical' ? sliderDom.current.offsetHeight : sliderDom.current.offsetWidth
      const containerSizeVal = mode === 'vertical' ? containerDom.current.clientHeight : containerDom.current.clientWidth
      setStep(stepVal)
      setSliderSize(sliderSizeVal)
      setContainerSize(containerSizeVal)
    }
    return () => {
      cancelAnimationFrame(requestRef.current)
    }
  }, [containerDom, sliderDom, sliderDomCopy])

  useEffect(() => {
    if (containerSize !== 0) {
      cancelAnimationFrame(requestRef.current)
      // 如果滚动容器大于滚动元素高度，则复制一份滚动元素，并设置复制元素的位置
      if (sliderSize > containerSize) {
        sliderDomCopy.current!.innerHTML = sliderDom.current!.innerHTML
        requestRef.current = requestAnimationFrame(marquee)
        containerDom.current!.onmouseover = () => {
          cancelAnimationFrame(requestRef.current)
        }
        containerDom.current!.onmouseout = () => {
          cancelAnimationFrame(requestRef.current)
          requestRef.current = requestAnimationFrame(marquee)
        }
        // 如果滚动容器小于滚动元素高度，则不滚动
      } else {
        sliderDomCopy.current!.innerHTML = ''
        containerDom.current!.onmouseover = null
        containerDom.current!.onmouseout = null
      }
    }
  }, [containerSize])

  const containerStyle: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '100%'
  }
  const WrapperStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: mode === 'vertical' ? 0 : 'auto',
    bottom: mode === 'vertical' ? 'auto' : 0,
    whiteSpace: mode === 'vertical' ? 'normal' : 'nowrap'
  }
  const sliderStyle: CSSProperties = {
    display: mode === 'vertical' ? 'block' : 'inline-block'
  }
  return (
    <div
      className={className}
      ref={(dom) => {
        if (dom) {
          containerDom.current = dom
        }
      }}
      style={{ ...containerStyle, ...style }}
    >
      <div
        ref={(dom) => {
          if (dom) {
            wrapperDom.current = dom
          }
        }}
        style={WrapperStyle}
      >
        <div
          style={sliderStyle}
          ref={(dom) => {
            if (dom) {
              sliderDom.current = dom
            }
          }}
        >
          {children}
        </div>
        <div
          style={sliderStyle}
          ref={(dom) => {
            if (dom) {
              sliderDomCopy.current = dom
            }
          }}
        />
      </div>
    </div>
  )
})

export default ScrollList
