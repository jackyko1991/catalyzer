# Data

`variants.csv`: an affinity ladder of engineered T-cell receptors against the same target, the NY-ESO-1 157-165
peptide (SLLMWITQC) on HLA-A*02:01. Every row cites its own source:

- Irving M. et al., *Interplay between T cell receptor binding kinetics and the level of cognate peptide presented
  by major histocompatibility complexes governs CD8+ T cell responsiveness*, J. Biol. Chem. 287, 23068 (2012),
  <https://doi.org/10.1074/jbc.M112.357673> (open access). Dissociation constants and half-lives were measured by
  surface plasmon resonance (BIAcore 3000, 25 °C, 1:1 Langmuir fit); the paper itself defines
  K_D = k_off / k_on and t½ = ln2 / k_off. The G50A row carries that paper's own published k_on and k_off, so a
  correct answer must reproduce them.
- Hebeisen M. et al., *Molecular insights for optimizing T cell receptor specificity against cancer*,
  Front. Immunol. 13, 973986 (2022), <https://doi.org/10.3389/fimmu.2022.973986> (CC BY). The measured optimum of
  killing lies at the DMβ and TMβ variants, not at the tightest receptor.

`2bnr.pdb`: the 1G4 T-cell receptor bound to the same NY-ESO-1 peptide on HLA-A2 (PDB
[2BNR](https://www.rcsb.org/structure/2BNR), X-ray, 1.9 Å; Chen J.-L. et al., J. Exp. Med. 201, 1243 (2005),
<https://doi.org/10.1084/jem.20042323>), downloaded unchanged from RCSB. PDB archive data are CC0 1.0:
<https://www.wwpdb.org/about/usage-policies>. Chains: A the MHC heavy chain, B β2-microglobulin, C the peptide,
D and E the receptor's two chains.

The kinetic-proofreading formula used here, fraction = (1 + k_off/k_p)^(-N), is the steady state stated in
Pettmann L. et al., *The discriminatory power of the T cell receptor*, eLife 10:e67092 (2021),
<https://doi.org/10.7554/eLife.67092> (CC BY), after McKeithan T. W., PNAS 92, 5042 (1995),
<https://doi.org/10.1073/pnas.92.11.5042>.
