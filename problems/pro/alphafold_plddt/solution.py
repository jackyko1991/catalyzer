def afdb_model_url(uniprot: str, version: int = 6) -> str:
    """The download address of the AlphaFold DB model (PDB format) for a UniProt accession.

    afdb_model_url("P01542") == "https://alphafold.ebi.ac.uk/files/AF-P01542-F1-model_v6.pdb"
    """
    return f"https://alphafold.ebi.ac.uk/files/AF-{uniprot}-F1-model_v{version}.pdb"


def plddt_per_residue(pdb_text: str) -> list[float]:
    """The pLDDT of each residue, in order: the B-factor column (61-66) of its CA atom."""
    plddt = []
    for line in pdb_text.splitlines():
        if line.startswith("ATOM  ") and line[12:16].strip() == "CA":
            plddt.append(float(line[60:66]))
    return plddt


def confidence_bands(plddt: list[float]) -> dict[str, int]:
    """How many residues fall in each band: "very_high" (> 90), "confident" (> 70), "low" (> 50), "very_low".
    All four keys are always present."""
    counts = {"very_high": 0, "confident": 0, "low": 0, "very_low": 0}
    for p in plddt:
        band = "very_high" if p > 90 else "confident" if p > 70 else "low" if p > 50 else "very_low"
        counts[band] += 1
    return counts
