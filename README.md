# Event Performance Tracker

A Next.js application that transforms Power BI event performance tracking into a modern web dashboard. This system enables organizations to track event metrics, analyze participant feedback, and identify improvement opportunities across different event cycles.

## 🚀 Features

### 📊 Power BI Visual Equivalents
- **Activity Gauge Component**: Circular progress indicators showing KPI achievement against targets
- **KPI Donut Charts**: Threshold-based donut charts with color coding for performance levels
- **Word Cloud Analysis**: Interactive word clouds for feedback sentiment analysis
- **Trend Visualization**: Line charts showing performance trends across event cycles

### 📈 Event Performance Tracking
- **Multi-Cycle Management**: Track events across different time periods (Q1, Q2, Q3, etc.)
- **KPI Monitoring**: Monitor satisfaction, engagement, attendance, and learning outcomes
- **Improvement Points**: Identify, track, and manage improvement opportunities
- **Feedback Analysis**: Automated sentiment analysis and keyword extraction

### 🎯 Key Metrics
- **Satisfaction Score**: Participant satisfaction ratings with target comparison
- **Engagement Rate**: Measure of participant engagement during events
- **Attendance Rate**: Track attendance against registrations
- **Learning Outcomes**: Assessment of learning objective achievement

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom theme
- **Database**: PostgreSQL with Prisma ORM
- **Charts**: Recharts for data visualization
- **Word Cloud**: D3.js with d3-cloud for text analysis
- **UI Components**: Custom components inspired by Power BI visuals

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-performance-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Create a .env file
   cp .env.example .env
   
   # Edit .env with your PostgreSQL connection string
   # DATABASE_URL="postgresql://username:password@localhost:5432/event_performance_tracker"
   ```

4. **Initialize the database**
   ```bash
   npx prisma db push
   npx prisma generate
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗃️ Database Schema

The application uses a comprehensive database schema to track:

- **Events**: Core event information and metadata
- **Event Cycles**: Time-based periods within events (quarters, months, etc.)
- **Participants**: Event attendees and their information
- **Form Responses**: MS Forms data imported manually
- **Event Metrics**: KPIs and measurement definitions
- **Cycle Metrics**: Actual metric values for each cycle
- **Feedback Analysis**: Processed feedback with sentiment analysis
- **Improvement Points**: Identified areas for enhancement

## 📊 Dashboard Components

### Activity Gauges
Circular progress indicators showing:
- Current value vs. target
- Color-coded performance (red/yellow/green)
- Animated progress fill
- Percentage achievement display

### KPI Donut Charts
Donut charts featuring:
- Threshold-based coloring
- Center value display
- Target comparison
- Performance indicators

### Word Cloud
Interactive text visualization:
- Sentiment-based coloring
- Size-based frequency display
- Clickable words for detailed analysis
- Stop word filtering

### Trend Analysis
Performance trends showing:
- Multi-metric line charts
- Cycle-over-cycle comparison
- Interactive tooltips
- Responsive design

## 🔄 Data Flow

1. **MS Forms → Excel**: Participants fill out MS Forms
2. **Excel → Database**: Manual upload of XLSX files to PostgreSQL
3. **Database → Dashboard**: Real-time visualization of metrics
4. **Analysis → Improvements**: Identification of improvement points

## 🎨 Customization

### Theme Colors
The application uses a Power BI-inspired color scheme:
- Primary: Blue spectrum for main UI elements
- Success: Green for positive metrics/sentiment
- Warning: Yellow/amber for medium performance
- Danger: Red for low performance/negative sentiment

### Metrics Configuration
Add new metrics by:
1. Updating the `EventMetric` model
2. Creating corresponding gauge/chart components
3. Adding to the dashboard layout

## 📱 Responsive Design

The dashboard is fully responsive with:
- Mobile-first approach
- Adaptive grid layouts
- Touch-friendly interactions
- Scalable visualizations

## 🔧 Development

### Database Operations
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Open Prisma Studio
npm run db:studio

# Seed database with sample data
npm run db:seed
```

### Building for Production
```bash
npm run build
npm start
```

## 📝 Usage

1. **View Dashboard**: Access real-time event performance metrics
2. **Analyze Trends**: Track performance across multiple event cycles
3. **Review Feedback**: Examine participant feedback through word clouds
4. **Identify Improvements**: Monitor and manage improvement opportunities
5. **Compare Performance**: Benchmark against targets and previous cycles

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Power BI for visual inspiration
- D3.js community for word cloud implementation
- Recharts for chart components
- Prisma team for excellent database tooling

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the database schema

---

**Note**: This application transforms Power BI event tracking functionality into a modern web application while maintaining the same analytical capabilities and visual appeal. 