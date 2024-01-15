# DatoCMS Plugin: OEmbed

**[DatoCMS plugin](https://www.datocms.com/marketplace/plugins) to get embed data for external content, using the [OEmbed](https://oembed.com/).**

## OEmbed providers

This plugin supports [~300 content providers](https://oembed.com/providers.json) (like Twitter, YouTube, and many more) using the [OEmbed](https://oembed.com/) protocol.

## Packages

The OEmbed endpoints can't be called directly from a DatoCMS plugin due to CORS policies. This project therefore contains two packages:

- [`oembed-api`](/packages/oembed-api/): API to get OEmbed data for a given URL.
- [`oembed-plugin`](/packages/oembed-plugin/): DatoCMS plugin using the API package, storing the OEmbed data and showing an HTML preview.

<!--
Describe what your plugin does, and how users you can configure it! Screenshots are always welcome!
-->
