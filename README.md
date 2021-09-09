# deno-dev-template

[![ci](https://github.com/kawarimidoll/deno-dev-template/workflows/ci/badge.svg)](.github/workflows/ci.yml)
[![deno.land](https://img.shields.io/badge/deno-%5E1.13.0-green?logo=deno)](https://deno.land)
[![vr scripts](https://badges.velociraptor.run/flat.svg)](https://velociraptor.run)
[![LICENSE](https://img.shields.io/badge/license-MIT-brightgreen)](LICENSE)

my deno template

## Setup

Need to install [Velociraptor](https://velociraptor.run/).

Confirm there is `~/.deno/bin` in `$PATH` to use the scripts installed by
`deno install`.

```
$ # install velociraptor
$ deno install -qAn vr https://deno.land/x/velociraptor/cli.ts
$ # install hook
$ vr
```

The scripts are defined in [velociraptor.yml](velociraptor.yml).

[![deploy](https://deno.com/deno-deploy-button.svg)](https://cloudy-owl-71.deno.dev/)
