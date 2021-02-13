---
title: "How to access Azure Key Vault in Rust"
date: 2021-02-13T10:13:50Z
tags:
  - azure
  - rust
---

## Introduction

Since the Azure SDK for Rust is still not published on [crates.io](https://crates.io/), here is an example how to use the current git repo for accessing an Azure Key Vault.

## Cargo.toml

```toml
[package]
name = "keyvault-sample"
version = "0.1.0"
edition = "2018"

[dependencies]
azure_key_vault = { git = "https://github.com/Azure/azure-sdk-for-rust.git" }
azure_identity = { git = "https://github.com/Azure/azure-sdk-for-rust.git" }
tokio = { version = "1", features = ["full"] }
```

## main.rs

```rust
use azure_identity::token_credentials::ClientSecretCredential;
use azure_identity::token_credentials::TokenCredentialOptions;
use azure_key_vault::KeyVaultClient;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
  //azure credentials
  let client_id = "11111111-1111-1111-1111-111111111111".to_string();
  let client_secret = "super_secret_key".to_string();
  let tenant_id = "11111111-1111-1111-1111-111111111111".to_string();
  //keyvault data
  let keyvault_name = "my-personal-key-vault";
  let secret_name = "sb-connection-string";

  let creds = ClientSecretCredential::new(tenant_id,client_id,client_secret,
    TokenCredentialOptions::default(),
  );
  let mut client = KeyVaultClient::new(&creds, keyvault_name);

  let secret = client.get_secret(secret_name).await?;
  println!("{}",secret.value());
  Ok(())
}
```
