# react-native-shared-code
Analyses your React Native project and calculates the percentage of
* shared code across platforms
* platform specific code

## Formula
The formulas are based on the two ways of targeting specific platforms in React Native:
* [Platform module](https://facebook.github.io/react-native/docs/platform-specific-code.html#platform-module)
* [Platform-specific extensions](https://facebook.github.io/react-native/docs/platform-specific-code.html#platform-specific-extensions)

### Shared code
![shared code](https://latex.codecogs.com/png.latex?\dpi{150}&space;\fn_phv&space;\frac{.js\ LOC&space;-&space;Platform\ module\ LOC}{Total\ LOC})

### Platform specific
![platform specific](https://latex.codecogs.com/png.latex?\dpi{150}&space;\fn_phv&space;\frac{.ios.js|.android.js\ LOC\&space;&plus;&space;Platform\ module\ LOC}{Total\ LOC})


## Usage

### Installation
You can install `react-native-shared-code` either as a global package or a local module.
#### Global package

    npm install -g react-native-shared-code
    react-native-shared-code path-to-react-native-project

#### Local package

    npm install --save-dev react-native-shared-code
    
Add shared-code script to your `package.json`

    {
      "scripts": {
        "shared-code": "react-native-shared-code"
      }
    }

### API

      Usage: react-native-shared-code [path] [options]


      Commands:

        [path]     path to React Native project (default value is cwd)

      Options:

        -h, --help    output usage information
        -v, --version output the version number
        -p, --platform platform for which to calculate the shared code percentages.
                       Accepted values are ios, android and windows.
                       By default, it detects index.platform.js for android, ios, windows
        --verbose output debugging info

## Author
Fidan Hakaj
- email [fidan188@gmail.com](mailto:fidan188@gmail.com)
- twitter [twitter.com/fdnhkj](https://twitter.com/fdnhkj)

## Acknowledgments
- [Mateusz Zatorski](https://github.com/knowbody) for [having this awesome idea](https://medium.com/@knowbody/thanks-for-the-quick-response-martin-would-be-cool-to-have-a-tool-doing-this-ossprojectidea-58e98418afa3#.5w85l7k25)!
- [Martín Bigio](https://github.com/martinbigio) for sharing the script used [@instagram](https://medium.com/@martinbigio/we-used-a-script-to-consider-the-platform-extension-and-did-some-manual-work-on-top-of-that-to-c61ec586e7b7)
- [James Kyle](https://github.com/thejameskyle) & [Logan Smyth](https://github.com/loganfsmyth) for their help regarding babel ([babel plugin - get-structured information as output after static code analysis](http://stackoverflow.com/questions/42332401/babel-plugin-get-structured-information-as-output-after-static-code-analysis))