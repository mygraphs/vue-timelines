# API Service Interface

The Vue Timelines library uses an abstract API service interface that allows you to provide your own API implementation. This makes the library framework-agnostic and allows integration with any backend (REST, GraphQL, Firebase, etc.).

## Interface

All API services must implement the `ApiService` interface:

```javascript
class ApiService {
  async createTimeline(timeline) { }
  async updateTask(task) { }
  async createGroup(group) { }
  async fetchTimeline(id) { }
  async updateGroup(group) { }
  async deleteTask(taskId) { }
  async deleteGroup(groupId) { }
}
```

## Built-in Implementations

### NoopApiService

A no-operation service that does nothing. Useful for:
- Demo/static use cases
- Testing
- When API is not needed

```javascript
import { NoopApiService } from 'vue-timelines';

const apiService = new NoopApiService();
```

### DefaultApiService

Uses fetch API with configurable base URL and token. Compatible with the original implementation.

```javascript
import { DefaultApiService } from 'vue-timelines';

const apiService = new DefaultApiService({
  baseURL: 'https://api.example.com',
  apiToken: 'your-token-here'
});
```

## Usage in Vue Application

### Option 1: Via Plugin Options

```javascript
import { createApp } from 'vue';
import VueTimelines from 'vue-timelines';
import { DefaultApiService } from 'vue-timelines';

const app = createApp(App);

// Provide API service via plugin options
app.use(VueTimelines, {
  apiBaseURL: 'https://api.example.com',
  apiToken: 'your-token'
});

// Or provide custom service
const customApiService = new DefaultApiService({
  baseURL: 'https://api.example.com',
  apiToken: 'your-token'
});

app.use(VueTimelines, {
  apiService: customApiService
});
```

### Option 2: Create Store Manually

```javascript
import { createApp } from 'vue';
import { createTimelineStore } from 'vue-timelines';
import { DefaultApiService } from 'vue-timelines';

const apiService = new DefaultApiService({
  baseURL: 'https://api.example.com',
  apiToken: 'your-token'
});

const store = createTimelineStore(apiService);
const app = createApp(App);
app.use(store);
```

## Usage in Web Component

```html
<vue-timeline
  api-base-url="https://api.example.com"
  api-token="your-token"
  groups='[{"id":"1","name":"Group 1"}]'
  tasks='[...]'
></vue-timeline>
```

Or programmatically:

```javascript
const timeline = document.querySelector('vue-timeline');
// API service is created automatically from attributes
```

## Creating Custom API Service

### Example: REST API

```javascript
import { ApiService } from 'vue-timelines';

class MyRestApiService extends ApiService {
  constructor(config) {
    super();
    this.baseURL = config.baseURL;
    this.headers = config.headers || {};
  }

  async createTimeline(timeline) {
    const response = await fetch(`${this.baseURL}/timelines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers
      },
      body: JSON.stringify(timeline)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return {
      status: "success",
      event: await response.json()
    };
  }

  async updateTask(task) {
    const response = await fetch(`${this.baseURL}/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers
      },
      body: JSON.stringify(task)
    });

    return {
      status: "success",
      event: await response.json()
    };
  }

  // Implement other methods...
  async createGroup(group) { /* ... */ }
  async fetchTimeline(id) { /* ... */ }
  async updateGroup(group) { /* ... */ }
  async deleteTask(taskId) { /* ... */ }
  async deleteGroup(groupId) { /* ... */ }
}
```

### Example: GraphQL API

```javascript
import { ApiService } from 'vue-timelines';

class GraphQLApiService extends ApiService {
  constructor(config) {
    super();
    this.endpoint = config.endpoint;
    this.headers = config.headers || {};
  }

  async query(query, variables) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers
      },
      body: JSON.stringify({ query, variables })
    });

    const { data, errors } = await response.json();
    if (errors) {
      throw new Error(errors[0].message);
    }
    return data;
  }

  async createTimeline(timeline) {
    const mutation = `
      mutation CreateTimeline($input: TimelineInput!) {
        createTimeline(input: $input) {
          id
          title
          startDate
          endDate
        }
      }
    `;

    const data = await this.query(mutation, { input: timeline });
    return {
      status: "success",
      event: data.createTimeline
    };
  }

  // Implement other methods...
}
```

### Example: Firebase/Firestore

```javascript
import { ApiService } from 'vue-timelines';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase-config';

class FirebaseApiService extends ApiService {
  async createTimeline(timeline) {
    const docRef = await addDoc(collection(db, 'timelines'), timeline);
    const docSnap = await getDoc(docRef);

    return {
      status: "success",
      event: {
        id: docRef.id,
        ...docSnap.data()
      }
    };
  }

  async updateTask(task) {
    await updateDoc(doc(db, 'tasks', task.id), task);
    return {
      status: "success",
      event: task
    };
  }

  // Implement other methods...
}
```

## Data Formats

### Timeline Object

```typescript
interface Timeline {
  title: string;
  start_date: number;  // Unix timestamp in seconds
  end_date: number;    // Unix timestamp in seconds
  state?: string;
}
```

### Task Object

```typescript
interface Task {
  id: string;
  group_id: string;
  title: string;
  creationDate: number;  // Unix timestamp in seconds
  dueDate: number;       // Unix timestamp in seconds
  progress: number;      // 0.0 to 1.0
  priority: number;      // Row priority within group
}
```

### Group Object

```typescript
interface Group {
  id: string;
  name: string;
  gallery_id?: string;
  color_name?: string;
}
```

## Response Format

All API methods should return a Promise that resolves to:

```typescript
{
  status: "success",
  event: {
    // Timeline, Task, or Group object
  }
}
```

Or reject with an Error for failures.

## Error Handling

The library will catch errors from API calls. You can handle them in your application:

```javascript
try {
  await store.dispatch('api/createTimeline', timeline);
} catch (error) {
  console.error('Failed to create timeline:', error);
  // Show user-friendly error message
}
```

## Migration from Old API

If you're using the old hardcoded API approach:

**Before:**
```javascript
// Used process.env.VUE_APP_API_BASE_URL and VUE_APP_API_TOKEN
```

**After:**
```javascript
import { DefaultApiService } from 'vue-timelines';

const apiService = new DefaultApiService({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  apiToken: process.env.VUE_APP_API_TOKEN
});
```

