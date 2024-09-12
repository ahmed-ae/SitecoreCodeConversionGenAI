# Sitecore JSS AI-Powered Code Generator

[![Deploy to Vercel (prod)](https://github.com/ahmed-ae/SitecoreCodeConversionGenAI/actions/workflows/prod-deploy.yml/badge.svg?branch=main)](https://github.com/ahmed-ae/SitecoreCodeConversionGenAI/actions/workflows/prod-deploy.yml)

[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)

[![Sitecore JSS AI Code Generator](https://i.postimg.cc/T3SkLmJD/Sitecore-JSS-V0.png)](https://postimg.cc/Yv6NTvVr)

## 🚀 About The Project

This project is an AI-powered tool for Sitecore developers, leveraging the power of Generative AI to streamline the process of creating Sitecore JSS components. It offers two primary functionalities:

1. **Design-to-Code Conversion**: Transform any design, screenshot, or wireframe into a fully functional Sitecore JSS component (React/TypeScript) in seconds.

2. **Legacy Code Conversion**: Convert traditional Sitecore MVC or SXA Scriban components into modern Sitecore JSS components (React).

### Key Features

- 🎨 Convert designs to working Sitecore JSS components instantly
- 🔄 Real-time preview of generated components
- 💬 AI-powered chat for component customization
- 🔧 Legacy Sitecore code conversion

## 🛠️ Installation

Follow these steps to get your development environment set up:

1. Clone the repository

   ```bash
   git clone https://github.com/ahmed-ae/SitecoreCodeConversionGenAI.git
   ```

2. Navigate to the project directory

   ```bash
   cd SitecoreCodeConversionGenAI
   ```

3. Install dependencies

   ```bash
   npm install
   ```

4. Build the project

   ```bash
   npm run build
   ```

5. Set up environment variables
   You can either use OpenAI Gpt-4o or Anthropic Claude 3.5 Sonnet or both, first you need to get API keys for each:

   - Create a `.env.local` file in the root directory
   - Add your Anthropic API key:
     ```bash
     ANTHROPIC_API_KEY=your_api_key_here
     ```
   - Add your OpenAI API key:

     ```bash
     OPENAI_API_KEY=your_api_key_here
     ```

     Note: You can get the OpenAI API key from here: https://platform.openai.com/ or Anthropic API key from here: https://console.anthropic.com/

6. Start the development server

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action!

## 🖥️ Usage

1. **Design-to-Code Conversion**:

   - Upload your design image or provide a URL
   - Watch as the AI generates a Sitecore JSS component in real-time
   - Use the AI chat to make further customizations

2. **Legacy Code Conversion**:
   - Paste your Sitecore MVC or SXA Scriban code
   - Get the converted Sitecore JSS (React) component instantly

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/ahmed-ae/SitecoreCodeConversionGenAI/issues).

## 📝 License

This project is licensed under the GNU Lesser General Public License v3.0 (LGPLv3).

For more details, see the [GNU Lesser General Public License v3.0](https://choosealicense.com/licenses/lgpl-3.0/).

The GNU LGPLv3 is a free, copyleft license that allows the use of the software within proprietary software, provided that the proprietary software is dynamically linked against the licensed software. Any modifications to the LGPL-licensed code must be made available under the LGPL.
