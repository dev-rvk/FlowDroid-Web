### Requirements

1. Java installed (I am using version 17)
2. Android SDK (Not required if Android Studio is installed)

### Java Version Check

```
java -version
```

### Running Command (automatically run by the server)

```
java -jar soot-infoflow-cmd-jar-with-dependencies.jar -a <path_to_apk> -p <path_to_android_jars> -s <path_to_sources_sinks_file>
```

### Get the SDK Path

```sh
~/Library/Android/sdk/platforms/android-XX/android.jar
```

### Special Note

Ensure that the `ANDROID_SDK` environment variable is correctly set to the Android SDK path for your operating system in the `.env` file inside the server . This is crucial for the proper functioning of FlowDroid.

1. Rename `.env.example` to `.env`
2. Edit the `.env` and add the `ANDROID_SDK` path.

