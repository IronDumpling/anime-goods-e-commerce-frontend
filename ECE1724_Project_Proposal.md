#  ECE1724 Project Proposal

## An anime goods E-commerce Website

Student Names: Astra Yu, Chuyue Zhang, Qiao Song, Yushun Tang.

# Motivation

## Problem Statement

Recently, the anime community has grown significantly, and the demand for anime goods is on the rise. However, there’s a notable gap in the market: existing platforms either try to cater to all needs or are overly generic.

Traditional e-commerce sites on the market suffer from bloated functionality and complex architectures, leading to high development and maintenance costs while making it difficult to provide users with an efficient and intuitive shopping experience. To bridge the gap, we have chosen to develop a lightweight, function-focused, and well-structured e-commerce management system dedicated solely to anime goods—allowing the system to specialize in this specific field and provide a more in-depth, professional service and experience.

## Project Significance

From a business perspective, brick-and-mortar stores specializing in a single category are often favored by consumers for their comprehensive product lines and specialized shopping experience—like beauty has specialized cosmetics sites, and anime goods should have their unique ecosystem. Therefore, it is very important to integrate the existing scattered resources to establish a more authoritative anime-specialized website.

A specialized anime goods website would not only streamline the purchasing process but also foster a more immersive shopping experience tailored to anime fans’ needs. By integrating official product releases, limited editions and exclusive collaborations, the platform can establish itself as a trustworthy hub and a community of enthusiasts, eliminating the hassle of switching between various marketplaces.

It cannot only be a comprehensive anime goods website but also an online space that mirrors the passion and depth of anime culture itself.  This targeted approach ensures a stronger brand identity and consumer trust, filling a significant gap in the market that general e-commerce platforms fail to address.

## Existing Solutions and Limitations

Most e-commerce platforms in the current market are dominated by comprehensive or multi-category platforms, such as Amazon, which offer a wide range of product categories in an attempt to meet the needs of all users. However, this model often leads to complex platform functionality and information redundancy, causing users to spend more time filtering specific product categories, which impacts the shopping experience. Additionally, some small vertical e-commerce platforms still use traditional complex systems in their technical architecture, leading to high maintenance costs and difficulty in quickly adapting to market demands.

For anime goods—often officially sourced from Japan, the birthplace of anime culture—purchasing is particularly challenging.  Many Japanese websites do not support overseas purchases or offer an unfriendly buying experience for non-Japanese cardholders, leading to reliance on intermediaries and a proliferation of second-hand trading sites. This fragmented landscape forces anime fans to navigate between general e-commerce giants, niche import stores, and unofficial marketplaces, often facing inconsistent pricing, availability, and reliability. Coupled with some smaller vertical platforms relying on outdated, complex technical architectures that incur high maintenance costs and slow adaptation to market demands, the current shopping experience is inefficient and frustrating.  This underscores the urgent need for a centralized, dedicated anime goods platform that streamlines the process, ensuring a more reliable, specialized, and user-friendly shopping experience.

## Target User Groups

Our target audience primarily consists of anime enthusiasts, collectors, and fans who value authenticity and quality in anime goods.  They not only seek a streamlined and efficient shopping platform but also expect a professional, reliable purchasing experience, complemented by curated recommendations and community-driven brand services.

## Technical Approach

This project strictly meets all the technical requirements of the course, comprehensively covering core technologies such as front-end development, back-end services, database interaction, and cloud storage integration. Team members will master module collaboration in a front-end and back-end separation architecture, building responsive and user-friendly interfaces with React and Tailwind CSS, designing RESTful APIs based on Express.js, and achieving efficient data storage and interaction through PostgreSQL. The project will also integrate cloud storage through AWS S3 to enable efficient file management, thus creating both commercially valuable and technically mature online application, significantly improving the team's full-stack development experience.

# Objectives and Key Features

## Project Objectives

The objective of this project is to engineer a robust anime merchandise e-commerce platform that offers a seamless shopping experience for users and efficient administrative tools for managers. The platform will encompass an intuitive user interface, a maintainable and scalable backend architecture, and a normalized database schema to manage products, orders, user roles, and account data. Additionally, the system will incorporate features such as user authentication and authorization, simulated payment processing, and cloud storage integration to enhance usability.

In summary, the project objectives include:

* Develop a responsive and user-friendly interface.
* Construct a scalable backend for data management.
* Implement a normalized database to efficiently support users, products, and orders.
* Integrate user authentication, file handling, simulated payment processing, and email notifications.
* Ensure feasibility through modular design and cloud-based storage solutions.

![Figure 1](https://github.com/sudoytang/markdown-image-host/blob/main/ece1724s2_2025w/proposal/figure1.png?raw=true)

Figure 1\. Infrastructure Diagram

## Key Features

### Frontend

The frontend will deliver a seamless and engaging shopping experience with an intuitive interface, allowing users to easily browse, search, and filter products. Product detail views will provide rich visuals, detailed descriptions, pricing, and availability to support informed purchasing decisions. A smooth shopping journey will be ensured through features like a dynamic shopping cart and a streamlined checkout process. Designed to be fully responsive, the platform will offer a consistent and user-friendly experience across all devices. Built with React, Tailwind CSS, and Shadcn/UI, the frontend will prioritize speed, accessibility, and modern design standards.

* **Customer Features**: Customers will have an intuitive UI to browse products, place orders, and manage their personal information, such as phone number and email. A dedicated dashboard will allow them to track and update orders, ensuring a seamless shopping experience.
* **Product Features**: Users access a comprehensive product catalog with search and filtering capabilities, facilitating efficient exploration of anime goods. Each product detail view provides in-depth information, including pricing, stock availability, and images, enhancing the shopping experience. The platform supports a simulated checkout process directly from product views, streamlining the purchase journey.
* **Order Features**: Features a robust order management system that offers real-time tracking of purchases. A dedicated order list interface displays all current and past orders, while detailed order views allow users to monitor progress, initiate updates, or cancel orders as needed. Automated notifications keep customers informed about their order status, contributing to a transparent and reliable shopping experience.

![Figure 2](https://github.com/sudoytang/markdown-image-host/blob/main/ece1724s2_2025w/proposal/figure2.png?raw=true)

Figure 2\. Project Frontend Structure

### Backend

The backend will be developed using Express.js, following a micro-services inspired API architecture to efficiently handle core functionalities such as authentication, product management, and order processing.

#### Key Features:

* **RESTful API Endpoints**: Supports CRUD (Create, Read, Update, Delete) operations for users, products, order items, and orders.
* **User Authentication & Authorization**
* **Role-Based Access Control**: Allows customers to place orders while restricting administrative functions to authorized users.
* **File Handling & Cloud Storage**: Manages product images efficiently to optimize view load speeds and scalability.
* **Error Handling & Logging**: Ensures system reliability, maintainability, and streamlined debugging processes.

#### Tech Stack:

* **Express.js**: Handles API requests and business logic.
* **PostgreSQL**: Manages relational data for users, products, and orders.
* **Cloud Storage**: Stores product images to enhance performance and scalability.

![Figure 3](https://github.com/sudoytang/markdown-image-host/blob/main/ece1724s2_2025w/proposal/figure3.png?raw=true)

Figure 3\. Project Backend Workflow

### Database

The PostgreSQL database is designed to store and manage user, product, order, and order item data efficiently. The database schema is structured as follows:

* **Users Table:** Stores essential information for each account, with a boolean field distinguishing admins from regular users. The email field serves as a secondary index to optimize queries.
* **Products Table:** Contains detailed information for each product, including descriptions, pricing, and stock quantities. It also includes an enumerated type to record product status.
* **Orders Table:** Records the userID of the user who placed the order, timestamps for creation and updates, and a status enum. A user can have multiple orders, but each order is associated with exactly one user, using the userID field as a foreign key.
* **Order Items Table:** Each entry represents a specific product within an order. An order can have multiple order items, each of which references exactly one product. This establishes a many-to-many relationship between orders and products.

This schema ensures that multiple users can place multiple orders containing various products, thereby supporting a flexible and scalable e-commerce model.

![Figure 4](https://github.com/sudoytang/markdown-image-host/blob/main/ece1724s2_2025w/proposal/figure4.png?raw=true)

Figure 4\. Project Database Structure

### Advanced Features

To enhance functionality and security, the platform integrates:

* **Cloud Storage:** Utilizing services such as AWS S3 or Firebase Storage for hosting product images, ensuring fast load times and scalable storage.
* **Security Enhancements:** Employing user authentication and authorization mechanisms, such as two-factor authentication, and role-based access control.
* **Third-Party API Integration:** Incorporating external services to facilitate automated email notifications for order confirmations and updates.

## Project Scope & Feasibility

This project is designed to be a fully functional and scalable e-commerce platform that balances usability, security, and performance. Leveraging React for the frontend, Express.js for the backend, and PostgreSQL for data management ensures a maintainable and efficient system. The integration of modular APIs, cloud storage, and external services underscores the project's feasibility, aiming to deliver a user-friendly e-commerce solution within the given timeframe.

# Tentative Plan

Our team will work collaboratively to complete the project in a structured manner. Each team member will have a specific role to ensure efficient development.

## Task Details

Table 1\. Categories and task description

| Category | Description |
| :---- | :---- |
| Design | Analyze customer and admin requirements. Define user types, roles, and permissions. Specify necessary APIs, create API documentation. Determine database requirements, design database schema. Plan cloud storage integration. Set up development environments. Setup Git repository Setup frontend: React.js, Tailwind CSS, shadcn/ui. Setup backend: Node.js, Express.js, PostgreSQL. |
| Frontend | Build reactive views. User Views Order Views Product Views Admin Views Develop the frontend part for authentication and authorization. Design UI/UX. |
| Backend | Build backend services using Express.js. Implement database management and access. Design RESTful APIs. Users information Shopping functionality Admin management Authentication and authorization Design service for email notifications, ads. Integrate cloud storage. |
| Testing & Integration | Conduct frontend-backend integration. Perform unit and integration tests. API Calls Data Transmission Admin Operations Stability Performance |
| Deployment & Presentation | Deploy the system to a local server environment Finalize debugging Presentation Incorporate feedback from the team and mentors and make necessary optimizations and improvements. |

## Team Responsibilities

Table 2\. Responsibilities for each team member

| Category | Task Description | Astra Yu | Chuyue Zhang | Qiao Song | Yushun Tang |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Frontend | Frontend Utility Layer (API Client, Authentication, …) |  | ✓ |  | ✓ |
|  | Views Functionality |  | ✓ |  | ✓ |
|  | UI/UX Design |  | ✓ |  |  |
| Backend | Backend Utility Layer(Logging, Files, Error Handling, …) | ✓ |  | ✓ |  |
|  | PostgreSQL Database | ✓ |  | ✓ |  |
|  | Authentication & Access Control | ✓ |  | ✓ |  |
|  | Third Party Integration(Cloud Storage, …) | ✓ |  | ✓ |  |
|  | API Implementation | ✓ |  | ✓ |  |
| Testing & Product Management | Unit Tests | ✓ | ✓ | ✓ | ✓ |
|  | Integration Tests |  |  |  | ✓ |
|  | Performance Optimization |  | ✓ |  | ✓ |
|  | Product Status Tracking |  | ✓ |  |  |

## Timeline

Table 3\. Weekly timeline

| Week | Tasks |
| :---- | :---- |
| Week 1 | Define project structure, and set up a Git repository. Initialize frontend, Tailwind CSS, and shadcn/ui components. Set up Node.js, Express.js server, PostgreSQL database, and cloud storage. Design database schema and API structure. |
| Week 2 | Develop user authentication and authorization. Implement UI for the homepage and product listing view. Build API routes for product retrieval and user authentication. |
| Week 3 | Develop product details view (image preview, descriptions, price). Implement shopping cart functionality (add/remove items). Set up APIs for adding items to the cart. |
| Week 4 | Implement a checkout system (order placement and storage). Develop order confirmation view and email notifications. |
| Week 5 | Conduct UI/UX refinements and ensure full responsiveness. Implement search and filtering functionality. Perform backend optimizations and security checks. |
| Week 6 | Final bug fixes, performance optimizations, and documentation. Conduct user testing and prepare final deployment. Complete API documentation and final presentation. |

This structured **week-by-week roadmap** ensures that core functionalities are completed by **Week 4**, allowing **Weeks 5-6** for refinements, testing, and final adjustments. By efficiently distributing tasks among team members, we maximize productivity and guarantee the project’s successful completion within the six-week timeframe.
