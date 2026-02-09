# vendor_tool.py
import hashlib
import sys

# Your secret salt - MUST MATCH the one in activation_service.py
APP_SALT = "YOUR_SECRET_APP_SALT_HERE"  # Make sure this is IDENTICAL to activation_service.py

def generate_activation_code(machine_fingerprint: str, school_name: str) -> str:
    """Generate activation code for a specific machine and school"""
    # Important: This must match exactly what calculate_expected_code() does in activation_service.py
    # The formula is: hash(machine_fingerprint + school_name + APP_SALT)
    
    # Clean inputs (same as activation_service.py)
    machine_fingerprint = machine_fingerprint.strip().lower()
    school_name = school_name.strip()
    
    # Create the exact same raw string
    raw = machine_fingerprint + school_name + APP_SALT
    
    # Generate the same hash
    return hashlib.sha256(raw.encode()).hexdigest()[:12].upper()

def batch_generate():
    """Generate codes for multiple schools"""
    print("\n" + "="*50)
    print("BATCH MODE")
    print("="*50)
    
    machine_fp = input("Enter Machine Fingerprint: ").strip().lower()
    
    print("\nEnter school names (one per line). Type 'DONE' when finished:")
    schools = []
    while True:
        school = input("> ").strip()
        if school.upper() == "DONE":
            break
        if school:
            schools.append(school)
    
    if not machine_fp or not schools:
        print("❌ Machine fingerprint and at least one school required!")
        return
    
    print("\n" + "="*50)
    print("ACTIVATION CODES")
    print("="*50)
    
    for school in schools:
        code = generate_activation_code(machine_fp, school)
        print(f"\nSchool: {school}")
        print(f"Code: {code}")
    
    print("\n" + "="*50)

def verify_code():
    """Verify if a code is correct"""
    print("\n" + "="*50)
    print("CODE VERIFICATION")
    print("="*50)
    
    machine_fp = input("Enter Machine Fingerprint: ").strip().lower()
    school_name = input("Enter School Name: ").strip()
    code_to_check = input("Enter Code to Verify: ").strip().upper()
    
    expected = generate_activation_code(machine_fp, school_name)
    
    print("\n" + "="*50)
    print("VERIFICATION RESULT")
    print("="*50)
    print(f"School: {school_name}")
    print(f"Machine FP: {machine_fp[:16]}...")
    print(f"Expected Code: {expected}")
    print(f"Provided Code: {code_to_check}")
    print(f"Match: {'✅ YES' if code_to_check == expected else '❌ NO'}")
    print("="*50)

def main():
    print("="*50)
    print("ACTIVATION CODE GENERATOR (Vendor Tool)")
    print("="*50)
    print("\nThis tool generates activation codes for customers.")
    print("IMPORTANT: The APP_SALT in this file must match the")
    print("APP_SALT in activation_service.py exactly!")
    print("\nCurrent APP_SALT:", APP_SALT)
    print("="*50)
    
    while True:
        print("\nOptions:")
        print("1. Generate single activation code")
        print("2. Generate codes for multiple schools")
        print("3. Verify a code")
        print("4. Exit")
        
        choice = input("\nSelect option (1-4): ").strip()
        
        if choice == "1":
            print("\n" + "="*50)
            print("SINGLE CODE GENERATION")
            print("="*50)
            machine_fp = input("Enter Machine Fingerprint: ").strip()
            school_name = input("Enter School Name: ").strip()
            
            if not machine_fp or not school_name:
                print("❌ Both fields are required!")
                continue
            
            code = generate_activation_code(machine_fp, school_name)
            
            print("\n" + "="*50)
            print("✅ ACTIVATION CODE GENERATED")
            print("="*50)
            print(f"School: {school_name}")
            print(f"Machine Fingerprint: {machine_fp[:16]}...")
            print(f"Activation Code: {code}")
            print("\n" + "-"*50)
            print("📋 Instructions for customer:")
            print(f"1. School name must be: '{school_name}' (exact match)")
            print(f"2. Activation code: {code}")
            print("3. Both must be entered correctly")
            print("="*50)
            
        elif choice == "2":
            batch_generate()
            
        elif choice == "3":
            verify_code()
            
        elif choice == "4":
            print("\nExiting...")
            break
            
        else:
            print("❌ Invalid choice!")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nExiting...")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)