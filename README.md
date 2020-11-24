# openapi-toolchain

- serve openapi specification with swagger-ui
- generate openapi bundle json with resolve `allOf`

## usage

```sh
# swagger-ui
$ openapi-toolchain start path/to/openapi_spec.yaml

# generate bundle
$ openapi-toolchain bundle path/to/openapi_spec.yaml path/to/output/openapi_spec.bundle.json
```