'use client'

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import cloud from 'd3-cloud'
import { WordData } from '@/lib/text-processing'

interface WordCloudProps {
  words: WordData[]
  width?: number
  height?: number
  padding?: number
  className?: string
  onWordClick?: (word: WordData) => void
}

export function WordCloud({
  words,
  width = 600,
  height = 400,
  padding = 5,
  className = '',
  onWordClick,
}: WordCloudProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || words.length === 0) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Color scale based on sentiment
    const colorScale = (sentiment?: string) => {
      switch (sentiment) {
        case 'positive':
          return '#22c55e' // green-500
        case 'negative':
          return '#ef4444' // red-500
        case 'neutral':
          return '#6b7280' // gray-500
        default:
          return '#3b82f6' // blue-500
      }
    }

    // Size scale
    const maxSize = Math.max(...words.map(w => w.size))
    const minSize = Math.min(...words.map(w => w.size))
    const sizeScale = d3.scaleLinear()
      .domain([minSize, maxSize])
      .range([12, 48])

    // Create the layout
    const layout = cloud()
      .size([width, height])
      .words(words.map(w => ({
        ...w,
        size: sizeScale(w.size),
      })))
      .padding(padding)
      .rotate(() => (Math.random() - 0.5) * 60)
      .font('Arial')
      .fontSize(d => d.size)
      .on('end', draw)

    layout.start()

    function draw(words: any[]) {
      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height)

      const g = svg.append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`)

      const text = g.selectAll('text')
        .data(words)
        .enter().append('text')
        .style('font-size', d => `${d.size}px`)
        .style('font-family', 'Arial')
        .style('fill', d => colorScale(d.sentiment))
        .style('cursor', onWordClick ? 'pointer' : 'default')
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text(d => d.text)
        .on('mouseover', function(event, d) {
          d3.select(this)
            .style('opacity', 0.7)
            .style('font-weight', 'bold')
        })
        .on('mouseout', function(event, d) {
          d3.select(this)
            .style('opacity', 1)
            .style('font-weight', 'normal')
        })

      if (onWordClick) {
        text.on('click', (event, d) => onWordClick(d as WordData))
      }
    }
  }, [words, width, height, padding, onWordClick])

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg ref={svgRef} className="border border-gray-200 rounded-lg" />
      
      {/* Legend */}
      <div className="flex items-center space-x-4 mt-4 text-sm">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Positive</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-gray-500" />
          <span>Neutral</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Negative</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Other</span>
        </div>
      </div>
    </div>
  )
}

 