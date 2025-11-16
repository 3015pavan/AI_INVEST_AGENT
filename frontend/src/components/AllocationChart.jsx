import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function AllocationChart({ allocations }) {
  if (!allocations) {
    return <p>No allocation data available</p>;
  }

  const data = {
    labels: ['Stocks', 'Bonds', 'Cash', 'Other'],
    datasets: [
      {
        label: 'Portfolio Allocation (%)',
        data: [
          allocations.stocks || 0,
          allocations.bonds || 0,
          allocations.cash || 0,
          allocations.other || 0,
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',  // Blue for stocks
          'rgba(75, 192, 192, 0.8)',  // Green for bonds
          'rgba(255, 206, 86, 0.8)',  // Yellow for cash
          'rgba(153, 102, 255, 0.8)', // Purple for other
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.chartWrapper}>
        <Doughnut data={data} options={options} />
      </div>
      <div style={styles.summary}>
        <div style={styles.item}>
          <span style={styles.label}>Stocks:</span>
          <span style={styles.value}>{allocations.stocks?.toFixed(1) || 0}%</span>
        </div>
        <div style={styles.item}>
          <span style={styles.label}>Bonds:</span>
          <span style={styles.value}>{allocations.bonds?.toFixed(1) || 0}%</span>
        </div>
        <div style={styles.item}>
          <span style={styles.label}>Cash:</span>
          <span style={styles.value}>{allocations.cash?.toFixed(1) || 0}%</span>
        </div>
        <div style={styles.item}>
          <span style={styles.label}>Other:</span>
          <span style={styles.value}>{allocations.other?.toFixed(1) || 0}%</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  chartWrapper: {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    width: '100%',
    maxWidth: '400px',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
  },
  label: {
    fontWeight: '500',
  },
  value: {
    fontWeight: 'bold',
    color: '#007bff',
  },
};

export default AllocationChart;
