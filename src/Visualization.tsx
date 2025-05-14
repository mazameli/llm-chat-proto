import { Line } from 'react-chartjs-2'
import { useRef, useEffect, ForwardedRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

// Generate mock data for 90 days
const generateData = () => {
  const data = []
  const labels = []
  const today = new Date()
  
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    // Generate random data between 20 and 50
    data.push(Math.floor(Math.random() * 31) + 20)
  }
  
  return { labels, data }
}

const { labels, data } = generateData()

const chartData = {
  labels,
  datasets: [
    {
      label: 'Count of Customers',
      data,
      borderColor: '#2E96F1',
      backgroundColor: 'rgba(46, 150, 241, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Count of Customers',
      },
    },
    x: {
      title: {
        display: true,
        text: 'Created At',
      },
    },
  },
}

type VisualizationProps = { sidePanelOpen?: boolean }

export default function Visualization({ sidePanelOpen }: VisualizationProps) {
  const chartRef = useRef<any>(null)

  useEffect(() => {
    // Set tabIndex to -1 on the canvas to prevent it from capturing focus
    const chart = chartRef.current
    if (chart && chart.canvas) {
      chart.canvas.tabIndex = -1
    }
  }, [])

  // Resize chart when sidePanelOpen changes
  useEffect(() => {
    if (chartRef.current && chartRef.current.resize) {
      chartRef.current.resize()
    }
  }, [sidePanelOpen])

  return (
    <div
      className="h-[calc(100vh-3rem)] flex flex-col"
      style={{ width: sidePanelOpen ? 'calc(100vw - 500px)' : '100vw', transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)' }}
    >
      <h1 className="text-xl font-semibold text-gray-900 p-8 pb-0">Count of Customers by Created At</h1>
      <div className="flex-1 p-8 pt-6">
        <div className="bg-white rounded-lg shadow-sm h-full">
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
      </div>
    </div>
  )
} 