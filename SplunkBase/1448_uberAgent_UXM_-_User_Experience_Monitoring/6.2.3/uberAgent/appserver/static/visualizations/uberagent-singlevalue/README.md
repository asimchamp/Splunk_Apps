# Building the visualization

## Requirements

- You can build on a different machine than your Splunk installation. You need a mapped network drive to the root of your Splunk (e.g., `S:` -> `\\srv1\c$`)
- NPM

### CD into the visualization directory

    cd /d S:\Program Files\Splunk\etc\apps\uberAgent\appserver\static\visualizations\uberagent-singlevalue

### Install NPM dependencies

    npm install

### Build

This creates the file `visualization.js`:

    "s:\Program Files\Splunk\bin\splunk.exe" cmd node ./node_modules/webpack/bin/webpack.js
