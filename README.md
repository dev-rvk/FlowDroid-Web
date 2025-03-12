## Flow Droid Web App

### Prerequisites

1. Java installed (version 17 recommended)
2. Android SDK (Not required if Android Studio is installed)

### Java Version Check

To check if Java is installed and to verify the version, run:
```
java -version
```

### Android SDK Setup

To install the Android SDK, follow these steps:

1. Download the Android SDK from the [official website](https://developer.android.com/studio#downloads).
2. Follow the installation instructions for your operating system.



### Special Note

Ensure that the `ANDROID_SDK` environment variable is correctly set to the Android SDK path for your operating system in the `.env` file inside the server. This is crucial for the proper functioning of FlowDroid.

1. Rename `.env.example` to `.env`
2. Edit the `.env` and add the `ANDROID_SDK` path.

### Setting Up FlowDroid Client and Server

1. Clone the FlowDroid client repository:
   ```sh
   git clone https://github.com/dev-rvk/FlowDroid-Web.git
   ```
2. Navigate to the client directory:
   ```sh
   cd flow-droid-client
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start the client:
   ```sh
   npm run dev
   ```
5. Navigate to the server directory:
   ```sh
   cd flow-droid-server
   ```
6. Install dependencies:
   ```sh
   npm install
   ```
7. Start the server:
   ```sh
   npm run dev
   ```



