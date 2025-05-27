# Umbraco 13 POC

A proof-of-concept (POC) project demonstrating the latest features of **Umbraco 13** with **.NET 8**, focusing on modern content delivery, extensibility, and integration capabilities.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [BackOffice Administrator](#backoffice-administrator)
- [Implemented Features](#implemented-features)
  - [Content Delivery API](#content-delivery-api)
  - [WebHooks](#webhooks)
- [Useful Links](#useful-links)
- [License](#license)

---

## Overview

This repository showcases a POC for Umbraco 13, leveraging its new features such as the Content Delivery API and WebHooks. It aims to provide a reference for developers and teams planning to upgrade or start new projects on Umbraco 13.

---

## Features

- **Content Delivery API**: Modern, headless content delivery for frontend consumption.
- **Image Resizing**: Dynamic image resizing for better performance.
- **WebHooks**: Automate and integrate Umbraco events with external systems.
- **Umbraco Forms**: Flexible form management.
- **uSync**: Synchronize Umbraco settings and content across environments.

---

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- [SQL Server](https://www.microsoft.com/en-us/sql-server)
- [Umbraco 13](https://umbraco.com/products/umbraco-cms/)

### Setup

1. **Clone the repository:**
    ```sh
    git clone https://github.com/Eman-salah476/Umbraco13_POC.git
    cd Umbraco13_POC
    ```

2. **Restore packages and build:**
    ```sh
    dotnet restore
    dotnet build
    ```

3. **Configure database connection:**
    - Update your connection string in `appsettings.json` or `appsettings.Development.json`.

4. **Run the project:**
    ```sh
    dotnet run
    ```

5. **Access the Umbraco BackOffice:**
    - Navigate to `http://localhost:<port>/umbraco`

---

## BackOffice Administrator

> **Note:** These credentials are for demo purposes only; please change them in production.

- **Username:** `Administrator@Gafi.com`
- **Password:** `Dev@123456`

---

## Implemented Features

### Content Delivery API

- Implements Umbraco's native [Content Delivery API](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api)
- Custom filters and sorting for flexible data access.
- Example endpoints for fetching content.

### WebHooks

- Uses Umbraco's [WebHooks](https://docs.umbraco.com/umbraco-cms/reference/webhooks) for event-driven integrations.
- Includes custom extensions to log data to an external database.
- Sample configuration for default and custom webhooks.

---

## Useful Links

- [Umbraco 13 Documentation](https://docs.umbraco.com/)
- [Content Delivery API Docs](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api)
- [WebHooks Documentation](https://docs.umbraco.com/umbraco-cms/reference/webhooks)
- [Umbraco Forms](https://umbraco.com/products/umbraco-forms/)
- [uSync](https://usync.readthedocs.io/en/latest/)

---

## License

This project is provided as a proof-of-concept and does not come with any warranty. Please check individual package licenses for more information.

---
