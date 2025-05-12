# use-status-manager

A flexible and powerful React hook for managing the subscription and polling of status updates for multiple asynchronous candidates. Ideal for scenarios where you need to track the status of multiple items over time (e.g., file uploads, job queues, task processing, etc.).

## ✨ Features

- Subscribes to multiple items and monitors their status
- Periodic polling with debounced requests
- Tracks pending states for each candidate
- Customizable subscription keys and status logic
- Optional callbacks for subscription and unsubscription
- Type-safe with full TypeScript support

## 📦 Installation

```bash
npm install @gautamgiri/use-status-manager
# or
yarn add @gautamgiri/use-status-manager
```

## 🚀 Usage

```tsx
import { useStatusManager } from "@gautamgiri/use-status-manager";

const { subscribe, unsubscribe, isLoading, isPending } = useStatusManager({
  statusFn: fetchStatuses, // (candidates) => Promise<TData>
  onStatusUpdate: (candidate) => {
    console.log("Status updated:", candidate);
  },
  getSubscriptionKey: (candidate) => candidate.id,
  getStatusFromCandidate: (candidate) => candidate.status,
  getStatusForCandidate: (key, response) => response[key].status,
  onSubscribe: (candidate) => console.log("Subscribed:", candidate),
  onUnsubscribe: (candidate) => console.log("Unsubscribed:", candidate),
  updateInterval: 10000, // optional, default: 30000 (ms)
  debounceDelay: 500, // optional, default: 300 (ms)
});
```

## 🧠 API Reference

### `useStatusManager<T, TData, TStatus>(options)`

| Option                   | Type                                                      | Description                                                               |
| ------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| `statusFn`               | `(candidates: T[]) => Promise<TData>`                     | Function to fetch updated statuses for subscribed candidates.             |
| `onStatusUpdate`         | `(candidate: T) => void`                                  | Callback triggered when a candidate’s status changes.                     |
| `getSubscriptionKey`     | `(candidate: T) => string \| number \| symbol`            | Unique key used to identify each candidate.                               |
| `getStatusFromCandidate` | `(candidate: T) => TStatus`                               | Extracts the current status from a candidate.                             |
| `getStatusForCandidate`  | `(key: ValidSubscriptionKey, response: TData) => TStatus` | Extracts the status for a specific candidate from the response data.      |
| `onSubscribe?`           | `(candidate: T) => void`                                  | Optional callback invoked when a candidate is subscribed.                 |
| `onUnsubscribe?`         | `(candidate: T) => void`                                  | Optional callback invoked when a candidate is unsubscribed.               |
| `updateInterval?`        | `number`                                                  | How often to poll for updates, in milliseconds. Default: `30000`.         |
| `debounceDelay?`         | `number`                                                  | Debounce time before calling `statusFn`, in milliseconds. Default: `300`. |

## 📤 Returned Values

| Value         | Type                              | Description                                                                  |
| ------------- | --------------------------------- | ---------------------------------------------------------------------------- |
| `subscribe`   | `(candidate: T) => Promise<void>` | Adds a candidate to the subscription and performs an immediate status check. |
| `unsubscribe` | `(candidate: T) => void`          | Removes a candidate from the subscription.                                   |
| `isLoading`   | `boolean`                         | Whether a polling request is currently in progress.                          |
| `isPending`   | `(candidate: T) => boolean`       | Returns `true` if the candidate is waiting on an initial fetch.              |

## 🧪 Example Use Cases

- Monitoring upload progress
- Tracking background job statuses
- Watching live processing queues
- Managing real-time task states

## 🔧 Development

To contribute or run locally:

```bash
git clone https://github.com/gautamgiri-dev/use-status-manager
cd use-status-manager
npm install
npm run dev
```

## 📝 License

MIT © [Gautam Giri](https://github.com/gautamgiri-dev)
