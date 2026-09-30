import { expect } from "chai";
import { ethers } from "hardhat";
import { CertificateRegistry } from "../typechain-types";

describe("CertificateRegistry Smart Contract", function () {
  let registry: CertificateRegistry;
  let owner: any;
  let addr1: any;

  // Sample test SHA-256 hash formatted as bytes32
  const sampleHash1 = ethers.zeroPadValue("0x" + "a8f5f167f44f4964e6c998dee827110ca8f5f167f44f4964e6c998dee827110c", 32);
  const sampleHash2 = ethers.zeroPadValue("0x" + "b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2", 32);

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const CertificateRegistryFactory = await ethers.getContractFactory("CertificateRegistry");
    registry = (await CertificateRegistryFactory.deploy()) as unknown as CertificateRegistry;
    await registry.waitForDeployment();
  });

  it("1. Should deploy contract and set correct owner", async function () {
    expect(await registry.owner()).to.equal(owner.address);
  });

  it("2. Should register a certificate and emit CertificateRegistered event", async function () {
    const certId = "ECV-2026-001245";

    await expect(registry.registerCertificate(certId, sampleHash1))
      .to.emit(registry, "CertificateRegistered")
      .withArgs(certId, sampleHash1, owner.address, (val: any) => typeof val === "bigint" || typeof val === "number");

    expect(await registry.isCertificateRegistered(certId)).to.be.true;

    const cert = await registry.getCertificate(certId);
    expect(cert.id).to.equal(certId);
    expect(cert.certificateHash).to.equal(sampleHash1);
    expect(cert.issuer).to.equal(owner.address);
    expect(cert.revoked).to.be.false;
  });

  it("3. Should revert when registering duplicate Certificate ID", async function () {
    const certId = "ECV-2026-001245";

    await registry.registerCertificate(certId, sampleHash1);

    await expect(
      registry.registerCertificate(certId, sampleHash2)
    ).to.be.revertedWith("Certificate ID already registered");
  });

  it("4. Should revert when registering duplicate Certificate Hash", async function () {
    const certId1 = "ECV-2026-001245";
    const certId2 = "ECV-2026-009999";

    await registry.registerCertificate(certId1, sampleHash1);

    await expect(
      registry.registerCertificate(certId2, sampleHash1)
    ).to.be.revertedWith("Certificate hash already registered to another certificate");
  });

  it("5. Should verify a valid certificate hash", async function () {
    const certId = "ECV-2026-001245";

    await registry.registerCertificate(certId, sampleHash1);

    const [isValid, isRevoked] = await registry.verifyCertificate(certId, sampleHash1);
    expect(isValid).to.be.true;
    expect(isRevoked).to.be.false;
  });

  it("6. Should return invalid for wrong certificate hash", async function () {
    const certId = "ECV-2026-001245";

    await registry.registerCertificate(certId, sampleHash1);

    const [isValid, isRevoked] = await registry.verifyCertificate(certId, sampleHash2);
    expect(isValid).to.be.false;
    expect(isRevoked).to.be.false;
  });

  it("7. Should prevent non-owner from registering certificates", async function () {
    const certId = "ECV-2026-000001";

    await expect(
      registry.connect(addr1).registerCertificate(certId, sampleHash1)
    ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
  });

  it("8. Should allow owner to revoke certificate and emit CertificateRevoked event", async function () {
    const certId = "ECV-2026-001245";
    const reason = "Tampered metadata detected";

    await registry.registerCertificate(certId, sampleHash1);

    await expect(registry.revokeCertificate(certId, reason))
      .to.emit(registry, "CertificateRevoked")
      .withArgs(certId, sampleHash1, reason, (val: any) => typeof val === "bigint" || typeof val === "number");

    const cert = await registry.getCertificate(certId);
    expect(cert.revoked).to.be.true;
    expect(cert.revocationReason).to.equal(reason);
  });

  it("9. Should verify revocation state accurately", async function () {
    const certId = "ECV-2026-001245";

    await registry.registerCertificate(certId, sampleHash1);
    await registry.revokeCertificate(certId, "Administrative revocation");

    const [isValid, isRevoked] = await registry.verifyCertificate(certId, sampleHash1);
    expect(isValid).to.be.false;
    expect(isRevoked).to.be.true;
  });
});
