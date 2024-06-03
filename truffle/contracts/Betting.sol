// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Betting {
    struct Bet {
        address bettor;
        uint amount;
    }

    mapping(uint => Bet[]) public bets;
    uint public totalBetAmount;
    uint public ownerCommissionPercent = 5; // 5% commission to the owner
    address public owner;
    bool public bettingActive;
    uint constant NUM_SLOTS = 10;
    uint public winningSlot;

    mapping(uint => bool) public slotHasBets;
    uint public activeSlotsCount;
    mapping(address => bool) public hasBetThisRound;
    mapping(address => uint) public winningPool;

    struct BetInfo {
        uint totalBet;
        address[] winners;
        uint timeStamp;
    }
    BetInfo[] public betRecord;

    event BettingStart();
    event BettingEnded(uint slot);
    event NewBet(uint slot, uint amount);

    constructor() {
        owner = msg.sender;
        bettingActive = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    function startBetting() public {
        require(!bettingActive, "Betting is already active");
        bettingActive = true;
        emit BettingStart();
    }

    function bet(uint slot) public payable {
        require(bettingActive, "Betting is not active");
        require(slot < NUM_SLOTS, "Invalid slot number");
        require(msg.value > 0, "Bet amount cannot be zero");
        require(!hasBetThisRound[msg.sender], "User has already placed a bet this round");

        if (!slotHasBets[slot]) {
            slotHasBets[slot] = true;
            activeSlotsCount += 1;
        }

        bets[slot].push(Bet(msg.sender, msg.value));
        totalBetAmount += msg.value;
        hasBetThisRound[msg.sender] = true;

        emit NewBet(slot, msg.value);
    }

    function getAllBets() public view returns (Bet[][] memory betStatus) {
        betStatus = new Bet[][](NUM_SLOTS);

        for (uint i = 0; i < NUM_SLOTS; i++){
            Bet[] memory slotBets = new Bet[](bets[i].length);
            uint j = 0;
            while(j < bets[i].length){
                slotBets[j] = bets[i][j];
                j++;
            }
            betStatus[i] = slotBets;
        }

        return betStatus;
    }

    function getBetRecords() public view returns (BetInfo[] memory records) {
        records = new BetInfo[](betRecord.length);
        for (uint i = 0; i < records.length; i++) {
            records[i] = betRecord[i];
        }
        return records;
    }

    function getPrizePool (address _address) public view returns (uint) {
        return winningPool[_address];
    }

    function getPrize() public payable {
        uint prizeAmount = winningPool[msg.sender];
        require(prizeAmount > 0, "There are no funds in your winning pool.");

        winningPool[msg.sender] = 0;
        payable(msg.sender).transfer(prizeAmount);
    }

    function endBetting() public onlyOwner {
        require(bettingActive, "Betting is not active");
        require(activeSlotsCount > 1, "Betting must be in more than one slot");

        uint[] memory slot = new uint[](10);
        uint bettedSlots = 0;

        for (uint i = 0; i < NUM_SLOTS; i++){
            if(bets[i].length != 0) {
                slot[bettedSlots] = i;
                bettedSlots++;
            }
        }
        winningSlot = slot[rand() % bettedSlots];

        bettingActive = false;
        distributePrizes(winningSlot);
    }

    function distributePrizes(uint _winningSlot) private {
        uint totalWinningBets = 0;
        uint prizePool;
        Bet[] memory winningBets = bets[_winningSlot];

        // Calculate total bets for the winning slot
        for (uint i = 0; i < winningBets.length; i++) {
            totalWinningBets += winningBets[i].amount;
        }

        // Calculate commission and net prize pool
        uint ownerCommission = (totalBetAmount * ownerCommissionPercent) / 100;
        prizePool = totalBetAmount - ownerCommission;

        if (ownerCommission > 0) {
            payable(owner).transfer(ownerCommission);
        }    
        
        betRecord.push(BetInfo(totalBetAmount, new address[](0), block.timestamp));

        for (uint i = 0; i < winningBets.length; i++) {
            if (winningBets[i].amount > 0) {
                uint winPrize = (winningBets[i].amount * prizePool) / totalWinningBets;
                winningPool[winningBets[i].bettor] += winPrize;
                betRecord[betRecord.length - 1].winners.push(winningBets[i].bettor);
            }
        }

        emit BettingEnded(_winningSlot);

        resetBets();
    }

    function resetBets() private {
        for (uint i = 0; i < NUM_SLOTS; i++) {
            for (uint j = 0; j < bets[i].length; j++) {
                hasBetThisRound[bets[i][j].bettor] = false;
            }
        }

      for (uint i = 0; i < NUM_SLOTS; i++) {
          delete bets[i];
      }
      totalBetAmount = 0;
        
      for (uint i = 0; i < NUM_SLOTS; i++) {
        slotHasBets[i] = false;
      }
      activeSlotsCount = 0;
    }

    function rand() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, totalBetAmount)));
    }
}
