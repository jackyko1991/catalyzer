# Data

`dyes.csv`: eleven symmetric cyanine dyes, the length of their conjugated chain and their measured absorption
maximum. SMILES and the structures come from PubChem (public domain, US National Library of Medicine);
each λmax carries its own source in the `source` column:

| Source | What it gives | Where |
| --- | --- | --- |
| OMLC PhotochemCAD spectra | λmax of the 2,2′ dyes, with solvent and extinction coefficient | <https://omlc.org/spectra/PhotochemCAD/html/052.html>, <https://omlc.org/spectra/PhotochemCAD/html/075.html> |
| Fisher & Hamer, Proc. R. Soc. A 154, 703 (1936), via the Gustavus physical chemistry handout | λmax of the 4,4′ series | <https://gustavus.edu/academics/departments/chemistry/pchem/Absorption_Dyes.htm> |
| Sturmer, via the Lakehead CHEM 3451 lab manual, Table 7.1 | λmax of the thiacyanine series | <https://lakeheadu.ca/sites/default/files/uploads/31/CHEM_3451_lab_manual_F2013_UV-Vis.pdf> |
| FPbase | excitation maxima of Cy3 and Cy5 | <https://www.fpbase.org/spectra/> |

The free-electron (particle-in-a-box) model of these dyes is H. Kuhn, J. Chem. Phys. 16, 840 (1948),
<https://doi.org/10.1063/1.1747011>, and J. Chem. Phys. 17, 1198 (1949), <https://doi.org/10.1063/1.1747143>;
the form used here, λ = 8mcL²/(h(N+1)) with L = (P+3+α)·l and l = 1.39 Å, is the one in the Lakehead manual
(eqs 7.1–7.4) and the Gustavus handout.

Where a source does not state the solvent, the table says "not stated"; solvent shifts these maxima by a few
nanometres, so predictions are compared with a tolerance, never to the last digit.
