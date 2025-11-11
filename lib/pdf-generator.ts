import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { PlanData } from './client-plans'

export class PDFGenerator {
  async generateClientPlanPDF(planData: PlanData, clientName: string, planName: string, chartElements?: { pieChart?: HTMLElement, barChart?: HTMLElement, timeline?: HTMLElement }, companyName?: string): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15
    const footerHeight = 10
    const contentWidth = pageWidth - (margin * 2)
    const maxContentHeight = pageHeight - margin - footerHeight
    let yPosition = margin

    // Helper function to add text with word wrapping
    const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 11, align: 'left' | 'center' | 'right' = 'left', style: 'normal' | 'bold' | 'italic' = 'normal', color: number[] = [0, 0, 0]) => {
      // Ensure x position and width don't exceed page boundaries
      const maxX = pageWidth - margin
      const actualX = Math.min(x, maxX)
      const actualMaxWidth = Math.min(maxWidth, maxX - actualX)
      
      pdf.setFontSize(fontSize)
      pdf.setFont('helvetica', style)
      pdf.setTextColor(color[0], color[1], color[2])
      const lines = pdf.splitTextToSize(text, actualMaxWidth)
      const lineHeight = fontSize * 0.45
      
      lines.forEach((line: string, index: number) => {
        let xPos = actualX
        if (align === 'center') {
          const textWidth = pdf.getTextWidth(line)
          xPos = actualX + (actualMaxWidth - textWidth) / 2
        } else if (align === 'right') {
          const textWidth = pdf.getTextWidth(line)
          xPos = actualX + actualMaxWidth - textWidth
        }
        // Ensure text doesn't exceed page boundary
        if (xPos + pdf.getTextWidth(line) <= pageWidth - margin) {
          pdf.text(line, xPos, y + (index * lineHeight))
        }
      })
      
      pdf.setTextColor(0, 0, 0)
      return y + (lines.length * lineHeight)
    }

    // Helper function to add a section header
    const addSectionHeader = (title: string, y: number) => {
      if (y + 15 > maxContentHeight) {
        pdf.addPage()
        y = margin
      }
      // Ensure title fits within content width and doesn't exceed page
      const titleWidth = Math.min(contentWidth - 10, pageWidth - margin * 2 - 10)
      const headerWidth = Math.min(contentWidth, pageWidth - margin * 2)
      pdf.setFillColor(34, 197, 94)
      pdf.rect(margin, y, headerWidth, 8, 'F')
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(255, 255, 255)
      const titleLines = pdf.splitTextToSize(title, titleWidth)
      pdf.text(titleLines[0], margin + 5, y + 6)
      pdf.setTextColor(0, 0, 0)
      return y + 12
    }

    // Helper function to add a new page if needed
    const checkNewPage = (requiredHeight: number) => {
      if (yPosition + requiredHeight > maxContentHeight) {
        pdf.addPage()
        yPosition = margin
        return true
      }
      return false
    }

    // Helper function to format currency
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
    }

    // Helper function to add a two-column info box
    const addInfoBox = (label: string, value: string, y: number, labelWidth: number = contentWidth * 0.4) => {
      // Ensure labelWidth doesn't exceed content width
      const maxLabelWidth = Math.min(labelWidth, contentWidth * 0.5)
      const valueWidth = Math.max(contentWidth - maxLabelWidth - 5, contentWidth * 0.4)
      const valueXPos = margin + maxLabelWidth + 5
      
      // Ensure value doesn't exceed page boundary
      if (valueXPos + valueWidth > pageWidth - margin) {
        const adjustedValueWidth = pageWidth - margin - valueXPos
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(100, 100, 100)
        const labelHeight = addText(label + ':', margin, y, maxLabelWidth, 10, 'left', 'normal', [100, 100, 100])
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(0, 0, 0)
        const valueHeight = addText(value, valueXPos, y, adjustedValueWidth, 10, 'left', 'bold', [0, 0, 0])
        return Math.max(labelHeight, valueHeight) + 2
      }
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 100, 100)
      const labelHeight = addText(label + ':', margin, y, maxLabelWidth, 10, 'left', 'normal', [100, 100, 100])
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0)
      const valueHeight = addText(value, valueXPos, y, valueWidth, 10, 'left', 'bold', [0, 0, 0])
      return Math.max(labelHeight, valueHeight) + 2
    }

    // Helper function to add a table row
    const addTableRow = (cells: string[], y: number, widths: number[], isHeader: boolean = false, colors?: number[][]) => {
      const rowHeight = 7
      // Normalize widths to ensure they sum to 1.0
      const totalWidth = widths.reduce((sum, w) => sum + w, 0)
      const normalizedWidths = widths.map(w => w / totalWidth)
      
      // Ensure table doesn't exceed page width
      const tableWidth = Math.min(contentWidth, pageWidth - (margin * 2))
      
      if (isHeader) {
        pdf.setFillColor(34, 197, 94)
        pdf.rect(margin, y - 2, tableWidth, rowHeight, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFont('helvetica', 'bold')
      } else {
        pdf.setFillColor(250, 250, 250)
        pdf.rect(margin, y - 2, tableWidth, rowHeight, 'F')
        pdf.setTextColor(0, 0, 0)
        pdf.setFont('helvetica', 'normal')
      }
      
      let xPos = margin + 3
      let maxHeight = rowHeight
      
      cells.forEach((cell, index) => {
        let cellWidth = normalizedWidths[index] * tableWidth
        
        // Ensure xPos doesn't exceed page boundary
        if (xPos + cellWidth > pageWidth - margin) {
          cellWidth = pageWidth - margin - xPos
        }
        
        const availableWidth = Math.max(cellWidth - 6, 10) // Padding on both sides, minimum 10mm
        const align = (index === cells.length - 1 || (index > 0 && index < cells.length - 1 && widths[index] < 0.2)) ? 'right' : 'left'
        const color = colors && colors[index] ? colors[index] : (isHeader ? [255, 255, 255] : [0, 0, 0])
        
        // Calculate text height to ensure it fits
        pdf.setFontSize(9)
        const textLines = pdf.splitTextToSize(cell, availableWidth)
        const textHeight = textLines.length * (9 * 0.45)
        if (textHeight > maxHeight) {
          maxHeight = textHeight + 2
        }
        
        addText(cell, xPos, y + 4, availableWidth, 9, align, isHeader ? 'bold' : 'normal', color)
        xPos += cellWidth
      })
      
      pdf.setTextColor(0, 0, 0)
      return y + maxHeight
    }

    // ============================================
    // COVER PAGE
    // ============================================
    pdf.setFillColor(34, 197, 94)
    pdf.rect(0, 0, pageWidth, pageHeight, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(32)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Evergreen Income Planner', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' })
    
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Prepared for ${clientName}`, pageWidth / 2, pageHeight / 2, { align: 'center' })
    
    if (companyName) {
      pdf.setFontSize(14)
      pdf.text(`Presented by ${companyName}`, pageWidth / 2, pageHeight / 2 + 15, { align: 'center' })
    }
    
    pdf.setFontSize(11)
    pdf.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, pageHeight - 30, { align: 'center' })
    
    pdf.addPage()
    yPosition = margin

    // ============================================
    // EXECUTIVE SUMMARY
    // ============================================
    yPosition = addSectionHeader('Executive Summary', yPosition)
    
    const totalAssets = planData.clientData.taxableFunds + planData.clientData.taxDeferredFunds + planData.clientData.taxFreeFunds
    const totalAllocated = planData.buckets.reduce((sum, bucket) => sum + (bucket.premiumAmount || 0), 0)
    const futureValue = planData.buckets.reduce((sum, bucket) => {
      const bucketData = planData.calculationResults[bucket.id]
      return sum + (bucketData?.futureValue || 0)
    }, 0)
    const totalIncome = planData.buckets.reduce((sum, bucket) => {
      const bucketData = planData.calculationResults[bucket.id]
      return sum + (bucketData?.incomeSolve || 0)
    }, 0)
    const totalMonthlyIncome = totalIncome / 12

    // Summary cards in 2x2 grid
    const summaryCards = [
      { label: 'Total Investment', value: formatCurrency(totalAllocated) },
      { label: 'Projected Future Value', value: formatCurrency(futureValue) },
      { label: 'Annual Income Generated', value: formatCurrency(totalIncome) },
      { label: 'Monthly Income Generated', value: formatCurrency(totalMonthlyIncome) }
    ]

    const cardSpacing = 5
    const cardWidth = Math.min((contentWidth - cardSpacing) / 2, (pageWidth - margin * 2 - cardSpacing) / 2)
    const cardHeight = 20
    let cardY = yPosition

    summaryCards.forEach((card, index) => {
      const col = index % 2
      const row = Math.floor(index / 2)
      const xPos = margin + (col * (cardWidth + cardSpacing))
      const yPos = cardY + (row * (cardHeight + cardSpacing))

      // Check if card fits on page
      if (yPos + cardHeight > maxContentHeight) {
        pdf.addPage()
        cardY = margin
        const newYPos = cardY + (row * (cardHeight + cardSpacing))
        const newXPos = margin + (col * (cardWidth + cardSpacing))
        
        // Ensure new card doesn't exceed page width
        const newCardWidth = Math.min(cardWidth, pageWidth - margin - newXPos)
        
        pdf.setFillColor(250, 250, 250)
        pdf.rect(newXPos, newYPos, newCardWidth, cardHeight, 'F')
        pdf.setDrawColor(200, 200, 200)
        pdf.setLineWidth(0.5)
        pdf.rect(newXPos, newYPos, newCardWidth, cardHeight, 'S')

        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(100, 100, 100)
        addText(card.label, newXPos + 5, newYPos + 6, newCardWidth - 10, 9, 'left', 'normal', [100, 100, 100])
        
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(34, 197, 94)
        addText(card.value, newXPos + 5, newYPos + 14, newCardWidth - 10, 14, 'left', 'bold', [34, 197, 94])
      } else {
        // Ensure card doesn't exceed page width
        const actualCardWidth = Math.min(cardWidth, pageWidth - margin - xPos)
        
        pdf.setFillColor(250, 250, 250)
        pdf.rect(xPos, yPos, actualCardWidth, cardHeight, 'F')
        pdf.setDrawColor(200, 200, 200)
        pdf.setLineWidth(0.5)
        pdf.rect(xPos, yPos, actualCardWidth, cardHeight, 'S')

        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(100, 100, 100)
        addText(card.label, xPos + 5, yPos + 6, actualCardWidth - 10, 9, 'left', 'normal', [100, 100, 100])
        
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(34, 197, 94)
        addText(card.value, xPos + 5, yPos + 14, actualCardWidth - 10, 14, 'left', 'bold', [34, 197, 94])
      }
    })

    yPosition = cardY + (cardHeight * 2) + cardSpacing + 5

    // ============================================
    // CLIENT INFORMATION
    // ============================================
    yPosition = addSectionHeader('Client Information', yPosition)

    const clientInfo = [
      ['Retirement Age', `${planData.clientData.retirementAge} years`],
      ['Income Start Age', `${planData.clientData.incomeStartAge} years`],
      ['Time Horizon', `${planData.clientData.timeHorizon} years`],
      ['Risk Tolerance', planData.clientData.riskTolerance.charAt(0).toUpperCase() + planData.clientData.riskTolerance.slice(1)],
      ['Tax Bracket', `${planData.clientData.taxBracket}%`],
      ['Desired Monthly Income', formatCurrency(planData.clientData.desiredMonthlyIncome)],
      ['Inflation Rate', `${planData.clientData.inflationRate}%`]
    ]

    clientInfo.forEach(([label, value]) => {
      yPosition = addInfoBox(label, value, yPosition)
    })

    yPosition += 5

    // ============================================
    // ASSET BREAKDOWN
    // ============================================
    yPosition = addSectionHeader('Asset Breakdown', yPosition)

    yPosition = addTableRow(
      ['Asset Type', 'Amount', 'Percentage'],
      yPosition,
      [0.5, 0.3, 0.2],
      true
    )

    const assetData = [
      ['Taxable Funds', formatCurrency(planData.clientData.taxableFunds), `${totalAssets > 0 ? ((planData.clientData.taxableFunds / totalAssets) * 100).toFixed(1) : 0}%`],
      ['Tax-Deferred Funds', formatCurrency(planData.clientData.taxDeferredFunds), `${totalAssets > 0 ? ((planData.clientData.taxDeferredFunds / totalAssets) * 100).toFixed(1) : 0}%`],
      ['Tax-Free Funds', formatCurrency(planData.clientData.taxFreeFunds), `${totalAssets > 0 ? ((planData.clientData.taxFreeFunds / totalAssets) * 100).toFixed(1) : 0}%`]
    ]

    assetData.forEach((row) => {
      yPosition = addTableRow(row, yPosition, [0.5, 0.3, 0.2])
    })

    // Total row
    pdf.setFillColor(240, 240, 240)
    pdf.rect(margin, yPosition - 2, contentWidth, 7, 'F')
    pdf.setFont('helvetica', 'bold')
    yPosition = addTableRow(
      ['Total Assets', formatCurrency(totalAssets), '100%'],
      yPosition,
      [0.5, 0.3, 0.2]
    )

    yPosition += 3

    // ============================================
    // INCOME STRATEGY BUCKETS
    // ============================================
    yPosition = addSectionHeader('Income Strategy Overview', yPosition)

    yPosition = addTableRow(
      ['Bucket', 'Investment', 'Future Value', 'Annual Income', 'Monthly Income'],
      yPosition,
      [0.25, 0.2, 0.2, 0.2, 0.15],
      true
    )

    planData.buckets.forEach((bucket) => {
      checkNewPage(10)
      const bucketData = planData.calculationResults[bucket.id]
      yPosition = addTableRow(
        [
          bucket.name,
          formatCurrency(bucket.premiumAmount || 0),
          formatCurrency(bucketData?.futureValue || 0),
          formatCurrency(bucketData?.incomeSolve || 0),
          formatCurrency((bucketData?.incomeSolve || 0) / 12)
        ],
        yPosition,
        [0.25, 0.2, 0.2, 0.2, 0.15]
      )
    })

    // Total row
    pdf.setFillColor(240, 240, 240)
    pdf.rect(margin, yPosition - 2, contentWidth, 7, 'F')
    pdf.setFont('helvetica', 'bold')
    yPosition = addTableRow(
      [
        'TOTAL',
        formatCurrency(totalAllocated),
        formatCurrency(futureValue),
        formatCurrency(totalIncome),
        formatCurrency(totalMonthlyIncome)
      ],
      yPosition,
      [0.25, 0.2, 0.2, 0.2, 0.15]
    )

    yPosition += 5

    // ============================================
    // DETAILED BUCKET INFORMATION
    // ============================================
    planData.buckets.forEach((bucket, index) => {
      yPosition = addSectionHeader(`Bucket ${index + 1}: ${bucket.name}`, yPosition)

      const bucketData = planData.calculationResults[bucket.id]

      // Investment Details
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(50, 50, 50)
      yPosition = addText('Investment Details', margin, yPosition, contentWidth, 11, 'left', 'bold', [50, 50, 50])
      yPosition += 3

      const investmentDetails = [
        ['Investment Type', bucket.investmentType || 'N/A'],
        ['Allocation Percentage', `${bucket.percentage || 0}%`],
        ['Premium Amount', formatCurrency(bucket.premiumAmount || 0)],
        ['Interest Rate', `${bucket.interestRate}%`],
        ['Delay Period', `${bucket.delayPeriod} years`],
        ['Income Periods', `${bucket.incomePeriods} years`],
        ['Timeframe', bucket.timeframe || 'N/A'],
        ['Risk Tolerance', bucket.riskTolerance.charAt(0).toUpperCase() + bucket.riskTolerance.slice(1)]
      ]

      investmentDetails.forEach(([label, value]) => {
        yPosition = addInfoBox(label, value, yPosition)
      })

      yPosition += 5

      // Projections
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(50, 50, 50)
      yPosition = addText('Projections & Calculations', margin, yPosition, contentWidth, 11, 'left', 'bold', [50, 50, 50])
      yPosition += 3

      if (bucketData) {
        const projections = [
          ['Estimated Premium', formatCurrency(bucketData.estimatedPremium || bucket.premiumAmount || 0)],
          ['Future Value', formatCurrency(bucketData.futureValue || 0)],
          ['Annual Payment', formatCurrency(bucketData.annuityPayment || 0)],
          ['Monthly Payment', formatCurrency((bucketData.annuityPayment || 0) / 12)],
          ['Annual Income (After Tax)', formatCurrency(bucketData.incomeSolve || 0)],
          ['Monthly Income (After Tax)', formatCurrency((bucketData.incomeSolve || 0) / 12)]
        ]

        projections.forEach(([label, value]) => {
          yPosition = addInfoBox(label, value, yPosition)
        })
      }

      yPosition += 5
    })

    // ============================================
    // HARVEST RETIREMENT PLAN
    // ============================================
    yPosition = addSectionHeader('Harvest Retirement Plan', yPosition)

    // Summary metrics
    const harvestMetrics = [
      ['Total Investment', formatCurrency(totalAllocated)],
      ['Projected Future Value', formatCurrency(futureValue)],
      ['Annual Income Need', formatCurrency(planData.clientData.annualPaymentNeeded)],
      ['Total Income Generated', formatCurrency(totalIncome)],
      ['Income Coverage', `${planData.clientData.annualPaymentNeeded > 0 ? ((totalIncome / planData.clientData.annualPaymentNeeded) * 100).toFixed(1) : 0}%`],
      ['Monthly Income Generated', formatCurrency(totalMonthlyIncome)],
      ['Monthly Income Need', formatCurrency(planData.clientData.desiredMonthlyIncome)],
      ['Monthly Income Gap', formatCurrency(planData.clientData.desiredMonthlyIncome - totalMonthlyIncome)]
    ]

    harvestMetrics.forEach(([label, value]) => {
      yPosition = addInfoBox(label, value, yPosition)
    })

    yPosition += 5

    // Income Timeline
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(50, 50, 50)
    yPosition = addText('Income Timeline', margin, yPosition, contentWidth, 11, 'left', 'bold', [50, 50, 50])
    yPosition += 5

    const incomeStartDelay = Math.max(1, planData.clientData.incomeStartAge - planData.clientData.retirementAge)
    const yearRanges = planData.buckets.length === 1 
      ? [`${incomeStartDelay}+`] 
      : planData.buckets.length === 2
      ? [`${incomeStartDelay}-${incomeStartDelay + 5}`, `${incomeStartDelay + 6}+`]
      : planData.buckets.length === 3
      ? [`${incomeStartDelay}-${incomeStartDelay + 4}`, `${incomeStartDelay + 5}-${incomeStartDelay + 9}`, `${incomeStartDelay + 10}+`]
      : [`${incomeStartDelay}-${incomeStartDelay + 4}`, `${incomeStartDelay + 5}-${incomeStartDelay + 9}`, `${incomeStartDelay + 10}-${incomeStartDelay + 14}`, `${incomeStartDelay + 15}+`]

    yPosition = addTableRow(
      ['Stage', 'Years', 'Investment', 'Annual Income', 'Monthly Income'],
      yPosition,
      [0.2, 0.15, 0.2, 0.25, 0.2],
      true
    )

    planData.buckets.forEach((bucket, index) => {
      checkNewPage(10)
      const bucketData = planData.calculationResults[bucket.id]
      yPosition = addTableRow(
        [
          bucket.growthStage || bucket.name,
          `Years ${yearRanges[index]}`,
          formatCurrency(bucket.premiumAmount || 0),
          formatCurrency(bucketData?.incomeSolve || 0),
          formatCurrency((bucketData?.incomeSolve || 0) / 12)
        ],
        yPosition,
        [0.2, 0.15, 0.2, 0.25, 0.2]
      )
    })

    // Total row
    pdf.setFillColor(240, 240, 240)
    pdf.rect(margin, yPosition - 2, contentWidth, 7, 'F')
    pdf.setFont('helvetica', 'bold')
    yPosition = addTableRow(
      [
        'TOTAL',
        `Years ${incomeStartDelay}+`,
        formatCurrency(totalAllocated),
        formatCurrency(totalIncome),
        formatCurrency(totalMonthlyIncome)
      ],
      yPosition,
      [0.2, 0.15, 0.2, 0.25, 0.2]
    )

    yPosition += 5

    // ============================================
    // CHARTS SECTION
    // ============================================
    if (chartElements) {
      // Portfolio Distribution Chart
      if (chartElements.pieChart) {
        yPosition = addSectionHeader('Portfolio Distribution', yPosition)

        try {
          const element = chartElements.pieChart as HTMLElement
          
          const chartCanvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 3,
            useCORS: true,
            allowTaint: true,
            logging: false,
            onclone: (clonedDoc) => {
              // Find the chart container
              const chartContainer = clonedDoc.querySelector('[data-chart]') || clonedDoc.body
              
              // Force white background on all elements
              const allElements = clonedDoc.querySelectorAll('*')
              allElements.forEach((el: any) => {
                if (el.style) {
                  // Force white background
                  el.style.backgroundColor = '#ffffff'
                  el.style.background = '#ffffff'
                  
                  // Change white text to black
                  const computedStyle = clonedDoc.defaultView?.getComputedStyle(el)
                  if (computedStyle) {
                    if (computedStyle.color === 'rgb(255, 255, 255)' || computedStyle.color === 'white') {
                      el.style.color = '#000000'
                    }
                    if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                      if (computedStyle.backgroundColor.includes('slate') || 
                          computedStyle.backgroundColor.includes('rgb(15, 23, 42)') ||
                          computedStyle.backgroundColor.includes('rgb(30, 41, 59)') ||
                          computedStyle.backgroundColor.includes('rgb(51, 65, 85)')) {
                        el.style.backgroundColor = '#ffffff'
                      }
                    }
                  }
                }
              })
              
              // Process all SVG elements (Recharts uses SVG)
              const svgElements = clonedDoc.querySelectorAll('svg')
              svgElements.forEach((svg: any) => {
                svg.style.backgroundColor = '#ffffff'
                svg.setAttribute('style', 'background-color: #ffffff;')
                
                // Change all text elements in SVG from white to black
                svg.querySelectorAll('text, tspan').forEach((textEl: any) => {
                  const fill = textEl.getAttribute('fill')
                  if (fill === '#ffffff' || fill === 'white' || fill === 'rgb(255, 255, 255)') {
                    textEl.setAttribute('fill', '#000000')
                  }
                  // Update style attribute
                  const style = textEl.getAttribute('style') || ''
                  if (style.includes('fill') && (style.includes('#ffffff') || style.includes('white') || style.includes('rgb(255, 255, 255)'))) {
                    textEl.setAttribute('style', style.replace(/fill:\s*#ffffff|fill:\s*white|fill:\s*rgb\(255,\s*255,\s*255\)/gi, 'fill: #000000'))
                  }
                })
              })
              
              // Set body and html background to white
              if (clonedDoc.body) {
                clonedDoc.body.style.backgroundColor = '#ffffff'
              }
              if (clonedDoc.documentElement) {
                clonedDoc.documentElement.style.backgroundColor = '#ffffff'
              }
            }
          })

          const chartImg = chartCanvas.toDataURL('image/png', 1.0)
          const chartWidth = 170
          const chartHeight = (chartCanvas.height * chartWidth) / chartCanvas.width

          if (yPosition + chartHeight > maxContentHeight) {
            pdf.addPage()
            yPosition = margin
          }

          pdf.addImage(chartImg, 'PNG', margin, yPosition, chartWidth, chartHeight)
          yPosition += chartHeight + 5

          // Data table
          checkNewPage(15)
          yPosition = addTableRow(
            ['Bucket', 'Amount', 'Percentage'],
            yPosition,
            [0.5, 0.3, 0.2],
            true
          )

          planData.buckets.forEach((bucket) => {
            checkNewPage(8)
            const bucketData = planData.calculationResults[bucket.id]
            const actualValue = bucket.premiumAmount || bucketData?.estimatedPremium || 0
            const percentage = totalAllocated > 0 ? ((actualValue / totalAllocated) * 100).toFixed(1) : '0.0'
            yPosition = addTableRow(
              [bucket.name, formatCurrency(actualValue), `${percentage}%`],
              yPosition,
              [0.5, 0.3, 0.2]
            )
          })

          yPosition += 5
        } catch (error) {
          console.error('Error capturing portfolio chart:', error)
        }
      }

      // Annual Income Chart
      if (chartElements.barChart) {
        yPosition = addSectionHeader('Annual Income by Investment', yPosition)

        try {
          const element = chartElements.barChart as HTMLElement
          
          const chartCanvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 3,
            useCORS: true,
            allowTaint: true,
            logging: false,
            onclone: (clonedDoc) => {
              // Find the chart container
              const chartContainer = clonedDoc.querySelector('[data-chart]') || clonedDoc.body
              
              // Force white background on all elements
              const allElements = clonedDoc.querySelectorAll('*')
              allElements.forEach((el: any) => {
                if (el.style) {
                  // Force white background
                  el.style.backgroundColor = '#ffffff'
                  el.style.background = '#ffffff'
                  
                  // Change white text to black
                  const computedStyle = clonedDoc.defaultView?.getComputedStyle(el)
                  if (computedStyle) {
                    if (computedStyle.color === 'rgb(255, 255, 255)' || computedStyle.color === 'white') {
                      el.style.color = '#000000'
                    }
                    if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                      if (computedStyle.backgroundColor.includes('slate') || 
                          computedStyle.backgroundColor.includes('rgb(15, 23, 42)') ||
                          computedStyle.backgroundColor.includes('rgb(30, 41, 59)') ||
                          computedStyle.backgroundColor.includes('rgb(51, 65, 85)')) {
                        el.style.backgroundColor = '#ffffff'
                      }
                    }
                  }
                }
              })
              
              // Process all SVG elements (Recharts uses SVG)
              const svgElements = clonedDoc.querySelectorAll('svg')
              svgElements.forEach((svg: any) => {
                svg.style.backgroundColor = '#ffffff'
                svg.setAttribute('style', 'background-color: #ffffff;')
                
                // Change all text elements in SVG from white to black
                svg.querySelectorAll('text, tspan').forEach((textEl: any) => {
                  const fill = textEl.getAttribute('fill')
                  if (fill === '#ffffff' || fill === 'white' || fill === 'rgb(255, 255, 255)') {
                    textEl.setAttribute('fill', '#000000')
                  }
                  // Update style attribute
                  const style = textEl.getAttribute('style') || ''
                  if (style.includes('fill') && (style.includes('#ffffff') || style.includes('white') || style.includes('rgb(255, 255, 255)'))) {
                    textEl.setAttribute('style', style.replace(/fill:\s*#ffffff|fill:\s*white|fill:\s*rgb\(255,\s*255,\s*255\)/gi, 'fill: #000000'))
                  }
                })
              })
              
              // Set body and html background to white
              if (clonedDoc.body) {
                clonedDoc.body.style.backgroundColor = '#ffffff'
              }
              if (clonedDoc.documentElement) {
                clonedDoc.documentElement.style.backgroundColor = '#ffffff'
              }
            }
          })

          const chartImg = chartCanvas.toDataURL('image/png', 1.0)
          const chartWidth = 170
          const chartHeight = (chartCanvas.height * chartWidth) / chartCanvas.width

          if (yPosition + chartHeight > maxContentHeight) {
            pdf.addPage()
            yPosition = margin
          }

          pdf.addImage(chartImg, 'PNG', margin, yPosition, chartWidth, chartHeight)
          yPosition += chartHeight + 5

          // Data table
          checkNewPage(15)
          yPosition = addTableRow(
            ['Investment', 'Gross Income', 'Net Income'],
            yPosition,
            [0.4, 0.3, 0.3],
            true
          )

          planData.buckets.forEach((bucket) => {
            checkNewPage(8)
            const bucketData = planData.calculationResults[bucket.id]
            const grossIncome = bucketData?.payments || 0
            const netIncome = bucketData?.incomeSolve || 0
            yPosition = addTableRow(
              [bucket.name, formatCurrency(grossIncome), formatCurrency(netIncome)],
              yPosition,
              [0.4, 0.3, 0.3]
            )
          })

          yPosition += 5
        } catch (error) {
          console.error('Error capturing income chart:', error)
        }
      }

      // Growth Projection Timeline
      if (chartElements.timeline) {
        yPosition = addSectionHeader('Growth Projection Timeline', yPosition)

        try {
          const element = chartElements.timeline as HTMLElement
          
          const chartCanvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 3,
            useCORS: true,
            allowTaint: true,
            logging: false,
            onclone: (clonedDoc) => {
              // Find the chart container
              const chartContainer = clonedDoc.querySelector('[data-chart]') || clonedDoc.body
              
              // Force white background on all elements
              const allElements = clonedDoc.querySelectorAll('*')
              allElements.forEach((el: any) => {
                if (el.style) {
                  // Force white background
                  el.style.backgroundColor = '#ffffff'
                  el.style.background = '#ffffff'
                  
                  // Change white text to black
                  const computedStyle = clonedDoc.defaultView?.getComputedStyle(el)
                  if (computedStyle) {
                    if (computedStyle.color === 'rgb(255, 255, 255)' || computedStyle.color === 'white') {
                      el.style.color = '#000000'
                    }
                    if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                      if (computedStyle.backgroundColor.includes('slate') || 
                          computedStyle.backgroundColor.includes('rgb(15, 23, 42)') ||
                          computedStyle.backgroundColor.includes('rgb(30, 41, 59)') ||
                          computedStyle.backgroundColor.includes('rgb(51, 65, 85)')) {
                        el.style.backgroundColor = '#ffffff'
                      }
                    }
                  }
                }
              })
              
              // Process all SVG elements (Recharts uses SVG)
              const svgElements = clonedDoc.querySelectorAll('svg')
              svgElements.forEach((svg: any) => {
                svg.style.backgroundColor = '#ffffff'
                svg.setAttribute('style', 'background-color: #ffffff;')
                
                // Change all text elements in SVG from white to black
                svg.querySelectorAll('text, tspan').forEach((textEl: any) => {
                  const fill = textEl.getAttribute('fill')
                  if (fill === '#ffffff' || fill === 'white' || fill === 'rgb(255, 255, 255)') {
                    textEl.setAttribute('fill', '#000000')
                  }
                  // Update style attribute
                  const style = textEl.getAttribute('style') || ''
                  if (style.includes('fill') && (style.includes('#ffffff') || style.includes('white') || style.includes('rgb(255, 255, 255)'))) {
                    textEl.setAttribute('style', style.replace(/fill:\s*#ffffff|fill:\s*white|fill:\s*rgb\(255,\s*255,\s*255\)/gi, 'fill: #000000'))
                  }
                })
              })
              
              // Set body and html background to white
              if (clonedDoc.body) {
                clonedDoc.body.style.backgroundColor = '#ffffff'
              }
              if (clonedDoc.documentElement) {
                clonedDoc.documentElement.style.backgroundColor = '#ffffff'
              }
            }
          })

          const chartImg = chartCanvas.toDataURL('image/png', 1.0)
          const chartWidth = 170
          const chartHeight = (chartCanvas.height * chartWidth) / chartCanvas.width

          if (yPosition + chartHeight > maxContentHeight) {
            pdf.addPage()
            yPosition = margin
          }

          pdf.addImage(chartImg, 'PNG', margin, yPosition, chartWidth, chartHeight)
          yPosition += chartHeight + 5

          // Data table - show key years
          checkNewPage(15)
          yPosition = addTableRow(
            ['Year', 'Initial Investment', 'Projected Value', 'Cumulative Income'],
            yPosition,
            [0.15, 0.25, 0.3, 0.3],
            true
          )

          const yearsToShow = [1, 5, 10, 15, 20]
          yearsToShow.forEach((yearNum) => {
            checkNewPage(8)
            const year = yearNum
            const totalGrowth = planData.buckets.reduce((sum, bucket) => {
              const bucketData = planData.calculationResults[bucket.id]
              const estimatedPremium = bucket.premiumAmount || bucketData?.estimatedPremium || 0
              return sum + (estimatedPremium * Math.pow(1 + bucket.interestRate / 100, year))
            }, 0)

            const cumulativeIncome = planData.buckets.reduce((sum, bucket) => {
              const bucketData = planData.calculationResults[bucket.id]
              const incomeStartYear = bucket.delayPeriod || 1
              if (year >= incomeStartYear) {
                const yearsSinceStart = year - incomeStartYear + 1
                const maxIncomePeriods = bucket.incomePeriods || 999
                const yearsOfIncome = Math.min(yearsSinceStart, maxIncomePeriods)
                const bucketAnnualIncome = bucketData?.incomeSolve || bucketData?.payments || 0
                return sum + (bucketAnnualIncome * yearsOfIncome)
              }
              return sum
            }, 0)

            yPosition = addTableRow(
              [
                `Year ${year}`,
                formatCurrency(totalAssets),
                formatCurrency(totalGrowth),
                formatCurrency(cumulativeIncome)
              ],
              yPosition,
              [0.15, 0.25, 0.3, 0.3]
            )
          })

          yPosition += 5
        } catch (error) {
          console.error('Error capturing timeline:', error)
        }
      }
    }

    // ============================================
    // FOOTER ON ALL PAGES
    // ============================================
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(150, 150, 150)
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' })
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, pageHeight - 10)
      pdf.setTextColor(0, 0, 0)
    }

    return pdf.output('blob')
  }

  async downloadPDF(planData: PlanData, clientName: string, planName: string, chartElements?: { pieChart?: HTMLElement, barChart?: HTMLElement, timeline?: HTMLElement }, companyName?: string): Promise<void> {
    try {
      const blob = await this.generateClientPlanPDF(planData, clientName, planName, chartElements, companyName)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${clientName.replace(/\s+/g, '_')}_${planName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw new Error('Failed to generate PDF')
    }
  }
}

export const pdfGenerator = new PDFGenerator()
