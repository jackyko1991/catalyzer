# Valence electrons of the main-group elements the problem uses (the column of the periodic table).
VALENCE = {"H": 1, "B": 3, "C": 4, "N": 5, "O": 6, "F": 7, "P": 5, "S": 6, "Cl": 7, "Br": 7, "I": 7}


def formal_charge(element: str, lone_pair_electrons: int, bonding_electrons: int) -> int:
    """Formal charge = valence electrons - lone-pair electrons - half the bonding electrons.

    formal_charge("N", 0, 8) == 1   # nitrogen in NH4+
    Raise ValueError if bonding_electrons is odd.
    """
    if bonding_electrons % 2:
        raise ValueError("bonding electrons come in pairs")
    return VALENCE[element] - lone_pair_electrons - bonding_electrons // 2


def total_charge(atoms: list[tuple[str, int, int]]) -> int:
    """The charge of a whole Lewis structure: atoms is a list of (element, lone-pair electrons, bonding electrons).

    total_charge([("O", 6, 2), ("H", 0, 2)]) == -1   # hydroxide OH-
    """
    return sum(formal_charge(el, lone, bonding) for el, lone, bonding in atoms)
