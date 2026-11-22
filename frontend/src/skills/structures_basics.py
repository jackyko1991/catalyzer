import numpy as np
from Bio.PDB import NeighborSearch, PDBParser
from Bio.SVDSuperimposer import SVDSuperimposer

# The files are the viewer's: 1crn.pdb (PDB) and its AlphaFold model (structures/ on this site)
parser = PDBParser(QUIET=True)
crystal = parser.get_structure("1crn", "1crn.pdb")
model = parser.get_structure("af", "AF-P01542-F1-model_v6.aligned.pdb")

# 1. A structure is a tree: model → chain → residue → atom
chain = crystal[0]["A"]
print(len(chain), "residues;", sum(1 for _ in crystal.get_atoms()), "atoms")
res = chain[16]
print(res.get_resname(), res.id[1], [atom.get_id() for atom in res])

# 2. Coordinates are numpy arrays in ångströms
sg16, sg26 = chain[16]["SG"].coord, chain[26]["SG"].coord
print(f"S-S distance Cys16-Cys26: {np.linalg.norm(sg16 - sg26):.2f} Å")

# 3. Neighbours: which residues have an atom within 4 Å of Cys16?
search = NeighborSearch(list(crystal.get_atoms()))
near = {a.get_parent().id[1] for atom in res for a in search.search(atom.coord, 4.0)} - {16}
print(sorted(near))

# 4. An AlphaFold model keeps pLDDT in the B-factor column
plddt = [r["CA"].get_bfactor() for r in model.get_residues()]
print(f"mean pLDDT {np.mean(plddt):.1f}, lowest {min(plddt)} at residue {int(np.argmin(plddt)) + 1}")

# 5. RMSD of the alpha carbons after the best superposition
ca_x = np.array([r["CA"].coord for r in chain], float)
ca_m = np.array([r["CA"].coord for r in model.get_residues()], float)
sup = SVDSuperimposer()
sup.set(ca_x, ca_m)
sup.run()
print(f"CA RMSD model vs crystal: {sup.get_rms():.2f} Å")
