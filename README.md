# 🚀 AI-Powered WhatsApp Intelligence Suite

[![NestJS](https://img.shields.io/badge/Backend-NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma_7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Postgres](https://img.shields.io/badge/DB-PostgreSQL_%2B_pgvector-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Evolution API](https://img.shields.io/badge/Integration-Evolution_API-25D366?logo=whatsapp&logoColor=white)](https://evolution-api.com/)

A robust, full-stack monorepo architecture designed for building scalable, AI-driven WhatsApp solutions. This project integrates the **Evolution API** with a high-performance **NestJS** backend and a **React 19** frontend, leveraging **Prisma 7** and **pgvector** for advanced vector search and **RAG (Retrieval-Augmented Generation)** capabilities.

---

## 📖 About The Project

This repository serves as a modern foundation for creating intelligent conversational agents and CRM systems. Instead of relying on disparate services, this project unifies the infrastructure into a cohesive monorepo. It connects the messaging capabilities of the Evolution API with a custom business logic layer capable of semantic search and state management.

The goal is to provide a **production-ready architecture** where AI contexts (embeddings) meet real-time communication (WhatsApp).

## 🏗 Architecture Overview

The project follows a **Hybrid Monorepo** structure, optimized for developer experience and performance:

-   **Core Messaging Engine:** Uses a dedicated instance of Evolution API to handle the complexities of the WhatsApp protocol.
-   **Intelligent Backend:** A NestJS application acts as the "brain," orchestrating messages, managing business rules, and interacting with the vector database.
-   **Vector Database:** Utilizes PostgreSQL with the `pgvector` extension. This allows for storing high-dimensional embeddings directly alongside relational data, enabling semantic search (e.g., *"Find messages related to pricing"*).
-   **Reactive Frontend:** A React (Vite) dashboard for managing instances, viewing chats, and monitoring system status.

## 🛠 Tech Stack

### **Backend & Data**
*   **NestJS:** Modular architecture for scalable server-side logic.
*   **Prisma 7:** The latest ORM version, utilizing native PostgreSQL extensions for vector operations.
*   **PostgreSQL + pgvector:** Relational database supercharged with vector similarity search for AI context.
*   **Docker:** Used strictly for containerizing the persistence layer (Database & Redis), ensuring a consistent environment.

### **Integration & Performance**
*   **Evolution API:** The leading open-source WhatsApp API wrapper.
*   **Redis:** High-speed caching and queue management for message throughput.

### **Frontend**
*   **React 19:** Building a fast, interactive user interface.
*   **Vite:** Next-generation frontend tooling.
*   **TypeScript:** Strict typing used across the entire stack for maximum reliability.

## 📂 Project Structure

The repository is organized into three distinct domains:

```plaintext
/
├── backend/          # NestJS Application
│   ├── 🧠 Business Logic & AI Orchestration
│   └── 📚 Prisma 7 Service & Schemas
│
├── frontend/         # React Application
│   ├── 👥 User Dashboard
│   └── ⚙️ Instance Management UI
│
└── evolution-api/    # Messaging Engine
    └── ✉️ Official Evolution API Source
```

## 🌟 Key Features

*   **🔍 Semantic Context:** Built-in support for vector embeddings, allowing the system to "understand" and retrieve context from past conversations or knowledge bases.
*   **🏗 Monorepo Synergy:** Unified codebase facilitating easier type sharing and coordinated updates between services.
*   **🧱 Extensible Design:** The NestJS backend is decoupled from the WhatsApp provider logic, making it easy to swap integration layers or add new channels in the future.
*   **🛡 Type-Safe Database Access:** Leverages Prisma 7's latest features for type-safe interactions with both relational data and vector embeddings.
