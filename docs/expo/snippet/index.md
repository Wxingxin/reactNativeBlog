## components

```json
"rn view": {
  "prefix": "rn.show.view",
  "body": [
    "<View className=\"${2}\" ${3}>",
    "  ${1}",
    "</View>"
  ],
  "description": "rn view"
},
```

```json
"rn Text ": {
  "prefix": "rn.show.text",
  "body": [
    "<Text className=\"${2}\" ${3}>",
    "  ${1}",
    "</Text >"
  ],
  "description": "rn Text "
},
```

```json
"rn Image ": {
  "prefix": "rn.show.image ",
  "body": [
    "<Image source={${1}} className=\"${2}\" />"
  ],
  "description": "rn Image "
},
```

```json
"rn ImageBackground": {
  "prefix": "rn.show.imageBackground",
  "body": [
    "<ImageBackground source={${1}} className=\"${2}\" />"
  ],
  "description": "rn ImageBackground"
},
```

```json
"rn Pressable": {
  "prefix": "rn.interaction.pressable",
  "body": [
    "<Pressable onPress={$1} className=\"{$2}\">",
    "  ${3}",
    "</Pressable>"
  ],
  "description": "rn Pressable"
}，
```

```json
"rn Button ": {
  "prefix": "rn.interaction.Button ",
  "body": [
    "<Button  onPress={${1}} title=\" ${2}\"  className=\"${3}\" />"
  ],
  "description": "rn Button "
},
```

```json
"rn TouchableOpacity": {
  "prefix": "rn.interaction.TouchableOpacity",
  "body": [
    "<TouchableOpacity",
    "  onPress={${1}}",
    "  className=\"${2}\"",
    "/>"
  ],
  "description": "rn TouchableOpacity"
},
```

```json
"rn TextInput": {
  "prefix": "rn.interaction.TextInput",
  "body": [
    "<TextInput",
    "  placeholder=\"${1}\"",
    "  value={${2}}",
    "  onChangeText={${3}}",
    "  className=\"${4}\"",
    "/>"
  ],
  "description": "rn TextInput"
}
```

```json
"rn Switch": {
  "prefix": "rn.interaction.Switch",
  "body": [
    "<Switch",
    "  value={${1}}",
    "  onValueChange={${2}}",
    "  className=\"${3}\"",
    "/>"
  ],
  "description": "rn Switch"
},
```

```json
"rn FlatList": {
  "prefix": "rn.lite.FlatList",
  "body": [
    "<FlatList",
    "  data={${1}}",
    "  keyExtractor={${2}}",
    "  renderItem={${3}}",
    "  className=\"${4}\"",
    "/>"
  ],
  "description": "rn FlatList"
},
```

```json
"rn SectionList": {
  "prefix": "rn.lite.SectionList",
  "body": [
    "<SectionList",
    "  sections={${1}}",
    "  renderSectionHeader={${2}}",
    "  renderItem={${3}}",
    "  className=\"${4}\"",
    "/>"
  ],
  "description": "rn SectionList"
},
```

## function

```json
"rn export default function ": {
  "prefix": "rn.funexportdefault",
  "body": [
    "import { StyleSheet, Text, View } from \"react-native\";",
    "",
    "export default function ${1} (${2}) {",
    "  return <>",
    "    ${3}",
    "  </>;",
    "}",
    "",
    "const styles = StyleSheet.create({",
    "",
    "});"
  ],
  "description": "rn export default function "
},
```

```json
"rn const function ": {
  "prefix": "rn.funconst",
  "body": [
    "const ${1} = function (${2}){",
    "  ${3}",
    "}"
  ],
  "description": "rn const function "
},
```

```json

```

```json

```

```json

```

```json

```
