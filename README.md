# Advanced Tax Strategy Optimizer

### A Sophisticated Tax Planning & Modeling Tool for Wealth Management Professionals

[![Deploy to GitHub Pages](https://github.com/ablewealth/tax-strategy/actions/workflows/deploy.yml/badge.svg)](https://github.com/ablewealth/tax-strategy/actions/workflows/deploy.yml)

This repository contains the source code for the **Advanced Tax Strategy Optimizer**, a professional-grade web application built with React. It is designed for wealth managers and financial advisors to model, compare, and present sophisticated tax optimization strategies for high-net-worth and ultra-high-net-worth clients.

The application provides a dynamic and interactive interface for inputting client financial data and immediately seeing the potential tax savings from a suite of advanced strategies. It culminates in a polished, client-ready printable report.

---

## ✨ Key Features

The platform is built to handle complex financial scenarios with a focus on clarity and professional presentation.

#### Core Modeling & Analysis
* **Dynamic Calculation Engine:** Real-time calculation of baseline vs. optimized tax liability as strategies are enabled and inputs are modified.
* **State-Specific Tax Logic:** Accurately models tax implications for both **New Jersey (NJ)** and **New York (NY)**, accounting for differences in deductions, add-backs, and tax brackets.
* **Multi-Year Projections:** Forecasts tax scenarios over several years, with adjustable assumptions for income growth.
* **Executive Dashboard:** A high-level, graphical summary of the most critical metrics, including total tax savings, optimized liability, and capital allocated to strategies.

#### Comprehensive Strategy Suite
The optimizer includes a portfolio of advanced tax strategies relevant to high-income earners and business owners:
* **Systematic Investments:** Quantino DEALS™ for strategic capital loss harvesting.
* **Business Deductions:** Section 179 asset depreciation acceleration.
* **Retirement Planning:**
    * Solo 401(k) - Employee Contributions
    * Solo 401(k) - Employer Contributions
    * Defined Benefit Pension Plans
* **Alternative Investments:**
    * Energy Sector (Oil & Gas IDCs)
    * Entertainment (Film Financing via Section 181)
* **Philanthropic Planning:** Charitable Lead Annuity Trusts (CLATs).
* **Income Optimization:** Maximizing the 20% Qualified Business Income (QBI) deduction.

#### Reporting & Insights
* **Strategic Implementation Insights:** Context-aware recommendations and warnings are generated based on the selected strategies and client data, highlighting benefits and potential considerations (e.g., NJ depreciation add-backs).
* **Visual Projections:** Interactive charts from **Recharts** display annual tax liability comparisons and the growth of cumulative savings over time.
* **Professional Client Report:** Generates a meticulously designed, print-ready report suitable for presentation to UHNW clients, featuring a formal layout, sophisticated typography, and clear data visualization.

---

## 🚀 Live Demo

A live version of this application is deployed on GitHub Pages:

[**https://ablewealth.github.io/tax-strategy/**](https://ablewealth.github.io/tax-strategy/)

---

## 🛠️ Technology Stack

This project is built with a modern, robust set of technologies:

* **[React](https://reactjs.org/)**: The core JavaScript library for building the user interface.
* **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for professional and rapid styling.
* **[Recharts](https://recharts.org/)**: A composable charting library for creating beautiful data visualizations.
* **[Create React App](https://create-react-app.dev/)**: Used for the initial project setup and management of build scripts.

---

## ⚙️ Getting Started

To get a copy of the project up and running on your local machine for development and testing, follow these simple steps.

### Prerequisites
You will need [Node.js](https://nodejs.org/) (which includes npm) installed on your machine.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/ablewealth/tax-strategy.git](https://github.com/ablewealth/tax-strategy.git)
    ```

2.  **Navigate to the project directory:**
    ```sh
    cd tax-strategy
    ```

3.  **Install NPM packages:**
    ```sh
    npm install
    ```

4.  **Run the development server:**
    ```sh
    npm start
    ```

This runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser. The page will automatically reload when you make changes.

---

## 🚢 Deployment

This repository is configured for **automated deployment to GitHub Pages**. The workflow, defined in `.github/workflows/deploy.yml`, is triggered on every push to the `main` branch. It will automatically build the application and deploy the contents of the `build` folder.

---

## 📄 Disclaimer

This application is a proprietary modeling tool intended for illustrative and educational purposes only. It does not constitute legal, tax, or investment advice. All data and results are based on modeling assumptions that may not reflect actual outcomes or future tax law changes. Please consult with a qualified professional before implementing any strategy.
